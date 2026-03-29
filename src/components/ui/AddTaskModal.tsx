"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { Task, TaskCategory, HabitFrequency } from "@/types";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task> & { id?: string }) => void;
  initialData?: Task | null;
}

const CATEGORIES: { id: TaskCategory; label: string; icon: string }[] = [
  { id: "work", label: "Work", icon: "work" },
  { id: "health", label: "Health", icon: "favorite" },
  { id: "personal", label: "Personal", icon: "person" },
  { id: "learning", label: "Learning", icon: "menu_book" },
  { id: "fitness", label: "Fitness", icon: "fitness_center" },
  { id: "other", label: "Other", icon: "more_horiz" },
];

export function AddTaskModal({ isOpen, onClose, onSubmit, initialData }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("work");
  const [isHabit, setIsHabit] = useState(false);
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setCategory(initialData.category);
        setIsHabit(initialData.isHabit);
        setFrequency(initialData.frequency || "daily");
      } else {
        setTitle("");
        setCategory("work");
        setIsHabit(false);
        setFrequency("daily");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      id: initialData?.id,
      title: title.trim(),
      category,
      isHabit,
      frequency: isHabit ? frequency : undefined,
    });
    
    setTitle("");
    setCategory("work");
    setIsHabit(false);
    setFrequency("daily");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "EDIT TASK" : "NEW TASK"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#464555]">
            Task Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full rounded-lg border border-[rgba(70,69,85,0.2)] bg-[#0A0A0A] p-4 text-sm font-medium text-[#E2E2E2] placeholder:text-[#464555] focus:border-[#4F44E2] focus:outline-none transition-colors"
            autoFocus
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#464555]">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                  category === c.id
                    ? "border-[#4F44E2]/50 bg-[#4F44E2]/10 text-white"
                    : "border-[rgba(70,69,85,0.2)] bg-[#0A0A0A] text-[#464555] hover:border-[#464555]/50 hover:text-[#E2E2E2]"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{c.icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[rgba(70,69,85,0.2)] bg-[#0A0A0A] p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#E2E2E2]">Daily Habit</span>
              <span className="text-[10px] font-medium text-[#464555]">Repeat this task automatically</span>
            </div>
            <button
              type="button"
              onClick={() => setIsHabit(!isHabit)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isHabit ? "bg-[#4F44E2]" : "bg-[#2A2A2A]"
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                  isHabit ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          {isHabit && (
            <div className="mt-2 flex flex-col gap-2 border-t border-[rgba(70,69,85,0.2)] pt-3 text-[10px]">
              <label className="font-bold uppercase tracking-widest text-[#464555]">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                className="w-full rounded-lg bg-[#2A2A2A] border border-[rgba(70,69,85,0.2)] p-2 text-sm text-[#E2E2E2] focus:border-[#4F44E2] focus:outline-none"
              >
                <option value="daily">Every day</option>
                <option value="mon-sat">6 Days (Mon-Sat)</option>
                <option value="alternate">Alternate Days</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekends">Weekends (Sat-Sun)</option>
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full rounded-lg bg-[#E2E2E2] py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {initialData ? "Save Changes" : "Create Task"}
        </button>
      </form>
    </Modal>
  );
}
