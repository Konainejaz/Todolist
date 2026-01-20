"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from 'antd';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, SignalHigh, SignalMedium, SignalLow, Calendar as CalendarIcon, Type, AlignLeft, Flag } from "lucide-react";
import dayjs from 'dayjs';

export function AddTodoModal({ onAdd, onEdit, editData = null, trigger }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    if (open && editData) {
      setTitle(editData.title);
      setDescription(editData.description || '');
      setDueDate(editData.dueDate ? dayjs(editData.dueDate) : null);
      setPriority(editData.priority || 'medium');
    } else if (open && !editData) {
      setTitle('');
      setDescription('');
      setDueDate(null);
      setPriority('medium');
    }
  }, [open, editData]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    const taskData = {
      title,
      description,
      dueDate: dueDate ? dueDate.toDate() : null,
      priority,
    };

    if (editData) {
      onEdit({ ...editData, ...taskData });
    } else {
      onAdd({ ...taskData, completed: false });
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-xl px-6 text-white">
            <Plus size={18} /> <span className="font-semibold">Add Task</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass border-0 shadow-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-b from-white/50 to-transparent dark:from-slate-800/50">
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            {editData ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {editData ? 'Update the details of your task below.' : 'Fill in the details to create a new task.'}
          </p>
        </DialogHeader>
        
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Type size={14} /> Title
            </label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <AlignLeft size={14} /> Description
            </label>
            <Input
              id="description"
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all h-11"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CalendarIcon size={14} /> Due Date
              </label>
              <DatePicker 
                onChange={setDueDate} 
                value={dueDate}
                className="w-full h-11 border-slate-200 hover:border-blue-400 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-md px-3"
                classNames={{ popup: "dark:bg-slate-800" }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Flag size={14} /> Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="glass-card backdrop-blur-xl">
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <SignalLow className="h-4 w-4 text-green-500" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <SignalMedium className="h-4 w-4 text-yellow-500" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <SignalHigh className="h-4 w-4 text-red-500" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 bg-slate-50/50 dark:bg-slate-900/30">
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-slate-200/50 dark:hover:bg-slate-800/50">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
            {editData ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
