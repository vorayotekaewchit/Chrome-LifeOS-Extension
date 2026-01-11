import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Plus, Trash2, Check, ArrowRight } from 'lucide-react';

type Priority = 'high' | 'medium' | 'low';

type Task = {
  id: string;
  text: string;
  priority: Priority;
  completed: boolean;
};

export function ChromeExtensionPopup() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [focusedTaskIndex, setFocusedTaskIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set current date
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(date.toLocaleDateString('en-US', options));

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('lifeOsTheme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('lifeOsTasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to load tasks:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('lifeOsTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem('lifeOsTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    // Focus edit input when editing starts
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to clear input or cancel editing
      if (e.key === 'Escape') {
        if (editingTaskId) {
          setEditingTaskId(null);
          setEditingText('');
        } else if (document.activeElement === inputRef.current) {
          setNewTaskText('');
        }
      }

      // Arrow key navigation when not editing
      if (!editingTaskId && document.activeElement === taskListRef.current) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedTaskIndex(prev => Math.min(prev + 1, tasks.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedTaskIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Delete' && focusedTaskIndex >= 0) {
          e.preventDefault();
          deleteTask(tasks[focusedTaskIndex].id);
        } else if (e.key === ' ' && focusedTaskIndex >= 0) {
          e.preventDefault();
          toggleTask(tasks[focusedTaskIndex].id);
        } else if (e.key === 'Enter' && focusedTaskIndex >= 0) {
          e.preventDefault();
          startEditingTask(tasks[focusedTaskIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTaskId, focusedTaskIndex, tasks]);

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        priority: 'medium',
        completed: false,
      };
      setTasks([newTask, ...tasks]);
      setNewTaskText('');
      // Announce to screen readers
      announceToScreenReader(`Task added: ${newTask.text}`);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        announceToScreenReader(`Task ${newCompleted ? 'completed' : 'uncompleted'}: ${task.text}`);
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.filter(task => task.id !== id));
    if (task) {
      announceToScreenReader(`Task deleted: ${task.text}`);
    }
    // Adjust focused index if needed
    if (focusedTaskIndex >= tasks.length - 1) {
      setFocusedTaskIndex(Math.max(0, tasks.length - 2));
    }
  };

  const cyclePriority = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const priorities: Priority[] = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(task.priority);
        const newPriority = priorities[(currentIndex + 1) % priorities.length];
        announceToScreenReader(`Task priority changed to ${newPriority}: ${task.text}`);
        return { ...task, priority: newPriority };
      }
      return task;
    }));
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEditingTask = () => {
    if (editingTaskId && editingText.trim()) {
      setTasks(tasks.map(task => 
        task.id === editingTaskId ? { ...task, text: editingText.trim() } : task
      ));
      announceToScreenReader(`Task updated: ${editingText}`);
    }
    setEditingTaskId(null);
    setEditingText('');
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.getElementById('sr-announcement');
    if (announcement) {
      announcement.textContent = message;
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return isDarkMode ? '#F87171' : '#EF4444';
      case 'medium': return isDarkMode ? '#FBBF24' : '#F59E0B';
      case 'low': return isDarkMode ? '#94A3B8' : '#94A3B8';
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    return `${priority.charAt(0).toUpperCase() + priority.slice(1)} priority`;
  };

  return (
    <div 
      className={`w-[360px] h-[500px] flex flex-col overflow-hidden ${
        isDarkMode ? 'dark bg-[#0F172A]' : 'bg-white'
      }`}
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
      role="application"
      aria-label="Life OS Task Manager"
    >
      {/* Screen reader announcements */}
      <div
        id="sr-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      />

      {/* Keyboard shortcuts help - visually hidden but accessible */}
      <div className="sr-only" role="region" aria-label="Keyboard shortcuts">
        Press Ctrl+K to focus on add task input. 
        Use arrow keys to navigate tasks.
        Press Space to toggle task completion.
        Press Enter to edit task.
        Press Delete to remove task.
        Press Escape to cancel editing.
      </div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`relative px-4 py-3 ${
          isDarkMode 
            ? 'bg-[rgba(30,41,59,0.6)]' 
            : 'bg-[rgba(255,255,255,0.8)]'
        }`}
        style={{
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-[20px] m-0 leading-tight"
              style={{ 
                color: isDarkMode ? '#60A5FA' : '#2563EB',
                fontWeight: 'bold',
                letterSpacing: '-0.01em'
              }}
            >
              Life OS
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-[12px] mt-1 m-0"
              style={{ 
                color: isDarkMode ? '#94A3B8' : '#64748B',
                fontWeight: 'normal'
              }}
            >
              {currentDate}
            </motion.p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-6 h-6 flex items-center justify-center rounded transition-colors duration-150"
              style={{
                backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                color: isDarkMode ? '#F1F5F9' : '#64748B'
              }}
              aria-label="Toggle theme"
            >
              <motion.div
                key={isDarkMode ? 'dark' : 'light'}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              </motion.div>
            </motion.button>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px]"
              style={{
                backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
                color: '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                fontWeight: '600'
              }}
            >
              LO
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Add Task Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="px-4 py-4"
      >
        <div className="flex gap-2">
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="flex-1 h-10 px-3 rounded-lg border transition-all duration-150 text-[14px]"
            style={{
              backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)',
              borderColor: isDarkMode ? '#334155' : '#E2E8F0',
              color: isDarkMode ? '#F1F5F9' : '#1E293B',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = isDarkMode ? '#60A5FA' : '#2563EB';
              e.target.style.boxShadow = isDarkMode 
                ? '0 0 0 3px rgba(96, 165, 250, 0.1)' 
                : '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = isDarkMode ? '#334155' : '#E2E8F0';
              e.target.style.boxShadow = 'none';
            }}
            ref={inputRef}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addTask}
            className="h-10 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-150 text-[14px]"
            style={{
              backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
              color: '#FFFFFF',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#2563EB' : '#1D4ED8';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#3B82F6' : '#2563EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <motion.div
              animate={{ rotate: newTaskText ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={16} />
            </motion.div>
            Add
          </motion.button>
        </div>
      </motion.div>

      {/* Task List Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex-1 px-4 overflow-y-auto"
        style={{ maxHeight: '280px' }}
        ref={taskListRef}
      >
        {tasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center h-full text-[14px]"
            style={{ color: isDarkMode ? '#64748B' : '#94A3B8' }}
          >
            No tasks yet. Add one above!
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="group relative h-12 px-3 py-2 rounded-md flex items-center gap-2 transition-all duration-150"
                  style={{
                    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#1E293B' : '#F1F5F9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#0F172A' : '#F8FAFC';
                  }}
                >
                  {/* Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: task.completed 
                        ? (isDarkMode ? '#60A5FA' : '#2563EB')
                        : (isDarkMode ? '#475569' : '#CBD5E1'),
                      backgroundColor: task.completed 
                        ? (isDarkMode ? '#60A5FA' : '#2563EB')
                        : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <AnimatePresence>
                      {task.completed && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                        >
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Priority Dot */}
                  <motion.button
                    whileHover={{ scale: 1.4 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    onClick={() => cyclePriority(task.id)}
                    className="flex-shrink-0 w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: getPriorityColor(task.priority),
                      cursor: 'pointer',
                      border: 'none'
                    }}
                    title={`${getPriorityLabel(task.priority)}. Click to change.`}
                    aria-label={`Change priority from ${task.priority}. Current: ${getPriorityLabel(task.priority)}`}
                  />

                  {/* Task Text or Edit Input */}
                  {editingTaskId === task.id ? (
                    <motion.input
                      ref={editInputRef}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveEditingTask();
                        } else if (e.key === 'Escape') {
                          cancelEditingTask();
                        }
                      }}
                      onBlur={saveEditingTask}
                      className="flex-1 text-[14px] px-2 py-1 rounded border"
                      style={{
                        backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                        borderColor: isDarkMode ? '#60A5FA' : '#2563EB',
                        color: isDarkMode ? '#F1F5F9' : '#1E293B',
                        outline: 'none',
                        fontWeight: 'normal'
                      }}
                      aria-label="Edit task text"
                    />
                  ) : (
                    <motion.span 
                      layout
                      onDoubleClick={() => startEditingTask(task)}
                      className="flex-1 text-[14px] truncate"
                      style={{
                        color: task.completed 
                          ? (isDarkMode ? '#64748B' : '#94A3B8')
                          : (isDarkMode ? '#F1F5F9' : '#1E293B'),
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.6 : 1,
                        fontWeight: 'normal',
                        cursor: 'text'
                      }}
                      title="Double-click to edit"
                    >
                      {task.text}
                    </motion.span>
                  )}

                  {/* Delete Button */}
                  <motion.button
                    initial={{ opacity: 0.4, scale: 1 }}
                    whileHover={{ scale: 1.15, opacity: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all duration-150"
                    style={{
                      color: isDarkMode ? '#F87171' : '#EF4444',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      border: 'none',
                      opacity: 0.4
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#1E293B' : '#FEE2E2';
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.opacity = '0.4';
                    }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Bottom Stats & Actions Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="px-4 py-3"
        style={{
          backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
          borderTop: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`
        }}
      >
        <div className="flex items-center justify-between">
          {/* Stats Display */}
          <div className="flex-1">
            <motion.p 
              key={`${completedCount}-${totalCount}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[14px] m-0 mb-2"
              style={{ 
                color: isDarkMode ? '#F1F5F9' : '#1E293B',
                fontWeight: '500'
              }}
            >
              {completedCount}/{totalCount} tasks completed
            </motion.p>
            <div 
              className="w-full h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: isDarkMode ? '#0F172A' : '#E2E8F0' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: isDarkMode ? '#60A5FA' : '#2563EB' }}
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* View Full App Button */}
          <motion.button
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('/', '_blank')}
            className="ml-4 h-9 px-4 rounded-lg flex items-center gap-2 transition-all duration-150 text-[13px]"
            style={{
              backgroundColor: 'transparent',
              border: `1px solid ${isDarkMode ? '#60A5FA' : '#2563EB'}`,
              color: isDarkMode ? '#60A5FA' : '#2563EB',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#60A5FA' : '#2563EB';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isDarkMode ? '#60A5FA' : '#2563EB';
            }}
          >
            View Full App
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight size={14} />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}