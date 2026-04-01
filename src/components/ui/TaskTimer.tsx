import React, { useEffect, useState } from "react";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface TaskTimerProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => Promise<void>;
  onComplete: () => Promise<void>;
}

export function TaskTimer({ task, onUpdate, onComplete }: TaskTimerProps) {
  const [localSpent, setLocalSpent] = useState(task.timeSpent || 0);

  useEffect(() => {
    // Sync local state if db updates it directly or component remounts
    if (!task.isRunning) {
       setLocalSpent(task.timeSpent || 0);
    }
  }, [task.timeSpent, task.isRunning]);

  useEffect(() => {
    if (!task.isRunning || !task.lastStartedAt) return;

    const targetSeconds = (task.targetTime || 0) * 60;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedActive = Math.floor((now - task.lastStartedAt!) / 1000);
      const total = (task.timeSpent || 0) + elapsedActive;
      
      setLocalSpent(total);

      if (total >= targetSeconds) {
         clearInterval(interval);
         onComplete().catch(console.error);
         onUpdate({ isRunning: false, timeSpent: targetSeconds }).catch(console.error);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [task.isRunning, task.lastStartedAt, task.timeSpent, task.targetTime, onComplete, onUpdate]);

  if (!task.targetTime || task.targetTime === 0) return null;

  const targetSeconds = task.targetTime * 60;
  const isCompleted = task.isCompleted;

  const toggleTimer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) return;
    
    if (task.isRunning) {
      // Pause
      const now = Date.now();
      const elapsedActive = Math.floor((now - (task.lastStartedAt || now)) / 1000);
      const newTotal = (task.timeSpent || 0) + elapsedActive;
      await onUpdate({ isRunning: false, timeSpent: newTotal });
    } else {
      // Start
      await onUpdate({ isRunning: true, lastStartedAt: Date.now() });
    }
  };

  const currentSeconds = task.isRunning 
    ? localSpent 
    : (task.timeSpent || 0);

  const progress = Math.min(100, (currentSeconds / targetSeconds) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const mStr = String(mins).padStart(2, "0");
    const sStr = String(secs % 60).padStart(2, "0");
    return `${mStr}:${sStr}`;
  };

  return (
    <button
      onClick={toggleTimer}
      disabled={isCompleted}
      title={`${Math.floor(progress)}% Complete (${formatTime(currentSeconds)} / ${task.targetTime}m)`}
      className={cn(
        "group relative flex h-6 w-[56px] sm:w-[64px] items-center overflow-hidden rounded-full border shrink-0 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
        task.isRunning 
          ? "border-[#4F44E2]/50 bg-[#4F44E2]/10 shadow-[0_0_10px_rgba(79,68,226,0.2)]" 
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 active:scale-95"
      )}
    >
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-linear",
          task.isRunning ? "bg-[#4F44E2]/20" : "bg-white/10"
        )}
        style={{ width: `${progress}%` }} 
      />
      
      <div className="absolute inset-0 flex items-center justify-center gap-0.5">
        <span className={cn(
          "material-symbols-outlined text-[10px] sm:text-[12px] transition-colors",
          task.isRunning ? "text-[#4F44E2]" : "text-[#8E8D99] group-hover:text-[#E2E2E2]"
        )} style={{ fontVariationSettings: "'FILL' 1" }}>
           {task.isRunning ? "pause_circle" : "play_circle"}
        </span>
        <span className={cn(
          "text-[8px] sm:text-[9px] font-mono font-bold tracking-tighter transition-colors select-none",
          task.isRunning ? "text-[#C4C0FF]" : "text-[#464555] group-hover:text-[#8E8D99]"
        )}>
          {Math.floor(progress)}%
        </span>
      </div>
    </button>
  );
}
