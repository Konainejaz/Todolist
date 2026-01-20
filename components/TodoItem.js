"use client"

import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton, Chip } from "@mui/material";
import { Trash2, Calendar, Clock, Pencil, MoreVertical, Flag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AddTodoModal } from "./AddTodoModal";

const priorityConfig = {
  low: { color: "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800", icon: "bg-green-500" },
  medium: { color: "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800", icon: "bg-yellow-500" },
  high: { color: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800", icon: "bg-red-500" }
};

const variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const priorityStyle = priorityConfig[todo.priority] || priorityConfig.medium;

  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative h-full"
    >
      {/* Glow Effect */}
      <div className={cn(
        "absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-40 blur transition duration-500",
        todo.completed ? "bg-gradient-to-r from-green-400 to-emerald-600" : "bg-gradient-to-r from-blue-500 to-purple-600"
      )} />
      
      <Card className={cn(
        "h-full relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col glass-card",
        todo.completed ? "opacity-80 bg-slate-50/50 dark:bg-slate-900/30" : ""
      )}>
        {/* Priority Indicator Line */}
        <div className={cn("absolute top-0 left-0 w-full h-1", priorityStyle.icon)} />

        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 w-full">
              <div className="relative pt-1">
                <Checkbox 
                  checked={todo.completed} 
                  onCheckedChange={() => onToggle(todo.id)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all duration-300",
                    todo.completed 
                      ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                      : "border-slate-300 hover:border-blue-400 dark:border-slate-600"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "text-lg font-bold leading-tight transition-all duration-300 break-words",
                  todo.completed ? "line-through text-slate-400 dark:text-slate-600" : "text-slate-800 dark:text-slate-100"
                )}>
                  {todo.title}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex-grow">
            {todo.description && (
              <p className={cn(
                "text-sm line-clamp-3 mb-3 transition-colors duration-300 break-words",
                todo.completed ? "text-slate-400 dark:text-slate-600" : "text-slate-600 dark:text-slate-400"
              )}>
                {todo.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
               <span className={cn(
                 "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1",
                 priorityStyle.color
               )}>
                 <Flag size={10} className="fill-current" />
                 {todo.priority}
               </span>
            </div>
          </div>

          <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex flex-col gap-1 text-xs text-slate-400">
               {todo.dueDate && (
                <span className={cn(
                  "flex items-center gap-1.5",
                  new Date(todo.dueDate) < new Date() && !todo.completed ? "text-red-500 font-medium" : ""
                )}>
                  <Calendar size={12} className={cn(
                    new Date(todo.dueDate) < new Date() && !todo.completed ? "text-red-500" : "text-blue-500"
                  )} />
                  {format(new Date(todo.dueDate), "MMM d, yyyy")}
                </span>
              )}
               <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {format(new Date(todo.createdAt), "h:mm a")}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               <AddTodoModal 
                onEdit={onEdit} 
                editData={todo} 
                trigger={
                  <IconButton size="small" className="text-blue-600/70 hover:text-blue-700 hover:bg-blue-100/50 dark:text-blue-400/80 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 transition-colors">
                    <Pencil size={16} />
                  </IconButton>
                }
              />
              <IconButton 
                onClick={() => onDelete(todo.id)}
                size="small" 
                className="text-red-600/70 hover:text-red-700 hover:bg-red-100/50 dark:text-red-400/80 dark:hover:text-red-300 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
