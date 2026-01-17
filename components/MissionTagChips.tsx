import { Target, Heart, DollarSign, Briefcase, Users } from "lucide-react";
import { MissionTag } from "../utils/storage";

interface MissionTagChipsProps {
  selectedTag?: MissionTag;
  onSelect: (tag: MissionTag) => void;
}

const TAGS: Array<{ name: MissionTag; icon: any; color: string }> = [
  { name: "Focus", icon: Target, color: "bg-purple-50 text-purple-600 border-purple-200" },
  { name: "Health", icon: Heart, color: "bg-green-50 text-green-600 border-green-200" },
  { name: "Money", icon: DollarSign, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { name: "Admin", icon: Briefcase, color: "bg-orange-50 text-orange-600 border-orange-200" },
  { name: "Relationships", icon: Users, color: "bg-pink-50 text-pink-600 border-pink-200" }
];

export function MissionTagChips({ selectedTag, onSelect }: MissionTagChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TAGS.map(({ name, icon: Icon, color }) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all duration-200 text-xs font-medium ${
            selectedTag === name 
              ? `${color} shadow-sm scale-105` 
              : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 hover:scale-105 active:scale-95'
          }`}
        >
          <Icon className="w-3 h-3" />
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
}

export function MissionTagPill({ tag }: { tag: MissionTag }) {
  const tagData = TAGS.find(t => t.name === tag);
  if (!tagData) return null;
  
  const Icon = tagData.icon;
  
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${tagData.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {tag}
    </span>
  );
}
