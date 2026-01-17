/**
 * Storage utilities with chrome.storage.sync support and localStorage fallback
 */

// Declare chrome for TypeScript
declare const chrome: any;

/**
 * Type guard to validate if a value is a valid Mission object.
 */
export function isMission(value: unknown): value is Mission {
  if (typeof value !== "object" || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.tag === "string" &&
    typeof obj.duration === "number" &&
    (obj.why === undefined || typeof obj.why === "string") &&
    (obj.completed === undefined || typeof obj.completed === "boolean") &&
    (obj.completedAt === undefined || obj.completedAt instanceof Date || typeof obj.completedAt === "string")
  );
}

/**
 * Type guard to validate if a value is a valid AppState object.
 */
export function isAppState(value: unknown): value is AppState {
  if (typeof value !== "object" || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    Array.isArray(obj.missions) &&
    obj.missions.every(isMission) &&
    typeof obj.xp === "number" &&
    typeof obj.streak === "number" &&
    Array.isArray(obj.last7Days) &&
    obj.last7Days.length === 7 &&
    obj.last7Days.every((item) => typeof item === "number") &&
    typeof obj.currentView === "string" &&
    ["input", "plan", "focus", "dashboard"].includes(obj.currentView) &&
    typeof obj.lastResetDate === "string" &&
    (typeof obj.weekStartDate === "string" || obj.weekStartDate === undefined)
  );
}

export interface Mission {
  id: string;
  title: string;
  tag: MissionTag;
  duration: number;
  why?: string;
  completed?: boolean;
  completedAt?: Date;
}

export type MissionTag = "Focus" | "Health" | "Money" | "Admin" | "Relationships";

export interface AppState {
  missions: Mission[];
  xp: number;
  streak: number;
  last7Days: number[];
  currentView: "input" | "plan" | "focus" | "dashboard";
  lastResetDate: string;
  weekStartDate: string; // Date string of Monday for the current week
}

/**
 * Safely parse JSON from storage with type validation and chrome.storage.sync support
 */
export async function safeGetFromStorage<T>(
  key: string,
  validator: (value: unknown) => value is T,
  fallback: T
): Promise<T> {
  try {
    // Try chrome.storage.sync first
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(key, (result: any) => {
          if (result[key]) {
            resolve(processResult(result[key], validator, fallback));
          } else {
            // Fallback to localStorage
            const item = localStorage.getItem(key);
            if (item === null) {
              resolve(fallback);
            } else {
              try {
                const parsed = JSON.parse(item);
                resolve(processResult(parsed, validator, fallback));
              } catch (e) {
                resolve(fallback);
              }
            }
          }
        });
      });
    }

    // Standard web fallback
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    const parsed = JSON.parse(item);
    return processResult(parsed, validator, fallback);
  } catch (error) {
    console.warn(`Failed to parse storage item "${key}":`, error);
    return fallback;
  }
}

function processResult<T>(parsed: any, validator: (value: unknown) => value is T, fallback: T): T {
  // Handle Date strings - convert completedAt strings back to Date objects
  if (validator(parsed) && Array.isArray((parsed as any).missions)) {
    (parsed as any).missions = (parsed as any).missions.map((mission: Mission) => {
      if (mission.completedAt && typeof mission.completedAt === "string") {
        return {
          ...mission,
          completedAt: new Date(mission.completedAt),
        };
      }
      return mission;
    });
  }
  return validator(parsed) ? parsed : fallback;
}

/**
 * Safely write JSON to storage with chrome.storage.sync support
 */
export async function safeSetToStorage<T>(key: string, value: T): Promise<boolean> {
  try {
    // Save to chrome.storage.sync
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ [key]: value });
    }
    
    // Always fallback/sync to localStorage
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to write to storage item "${key}":`, error);
    return false;
  }
}

/**
 * Get the Monday of the current week as a date string
 * Returns the date string for the Monday of the week containing the given date
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toDateString();
}

/**
 * Get the day index (0-6) for Monday-Sunday
 * 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
 */
export function getDayIndex(date: Date = new Date()): number {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return day === 0 ? 6 : day - 1; // Convert to Monday=0, Sunday=6
}
