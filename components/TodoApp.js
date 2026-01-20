"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { AddTodoModal } from "./AddTodoModal";
import { TodoItem } from "./TodoItem";
import { Segmented, Empty, message, notification } from "antd";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos", error);
      messageApi.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (todo) => {
    // Optimistic Update
    const tempId = Date.now().toString();
    const optimisticTodo = { ...todo, id: tempId, createdAt: new Date().toISOString() };
    setTodos((prev) => [optimisticTodo, ...prev]);
    
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
      });
      if (!res.ok) throw new Error("Failed to add");
      const newTodo = await res.json();
      // Replace optimistic todo with real one
      setTodos(prev => prev.map(t => t.id === tempId ? newTodo : t));
      messageApi.success("Task added successfully");
    } catch (error) {
      console.error("Failed to add todo", error);
      setTodos(prev => prev.filter(t => t.id !== tempId));
      messageApi.error("Failed to add task");
    }
  };

  const updateTodo = async (updatedTodo) => {
    // Optimistic Update
    const originalTodos = [...todos];
    setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));

    try {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });
      
      if (!res.ok) throw new Error("Failed to update");
      // messageApi.success("Task updated"); // Optional: might be too noisy for toggles
    } catch (error) {
      console.error("Failed to update todo", error);
      setTodos(originalTodos);
      messageApi.error("Failed to update task");
    }
  };

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      const updated = { ...todo, completed: !todo.completed };
      updateTodo(updated);
      if (updated.completed) {
         messageApi.success("Task completed");
      }
    }
  };

  const deleteTodo = async (id) => {
    // Optimistic Update
    const originalTodos = [...todos];
    const removedTodo = todos.find((t) => t.id === id);
    setTodos(todos.filter(t => t.id !== id));

    try {
      const res = await fetch(`/api/todos?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");

      if (removedTodo) {
        const key = `undo-delete-${id}`;
        notification.open({
          key,
          message: "Task deleted",
          description: "You can undo this action.",
          placement: "bottomRight",
          duration: 4,
          btn: (
            <Button
              size="sm"
              variant="outline"
              className="border-slate-200 bg-white hover:bg-slate-50"
              onClick={async () => {
                notification.destroy(key);
                try {
                  const { id: _id, createdAt: _createdAt, ...rest } = removedTodo;
                  await addTodo(rest);
                } catch {
                  messageApi.error("Undo failed");
                }
              }}
            >
              Undo
            </Button>
          ),
        });
      } else {
        messageApi.success("Task deleted");
      }
    } catch (error) {
      console.error("Failed to delete todo", error);
      setTodos(originalTodos);
      messageApi.error("Failed to delete task");
    }
  };

  const filteredTodos = todos.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'Active') return !t.completed;
    if (filter === 'Completed') return t.completed;
    if (filter === 'High Priority') return t.priority === 'high';
    return true;
  });

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 min-h-[400px]">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="w-full space-y-8">
      {contextHolder}
      {/* Controls Bar */}
      <div className="space-y-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 glass p-6 rounded-2xl sticky top-24 z-40 transition-all duration-300"
        >
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors h-4 w-4" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto flex justify-end">
            <AddTodoModal onAdd={addTodo} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full overflow-x-auto pb-2 sm:pb-0 glass p-3 rounded-2xl"
        >
            <Segmented
            options={[
              { label: 'All', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Completed', value: 'Completed' },
              { label: 'High Priority', value: 'High Priority' },
            ]}
            value={filter}
            onChange={setFilter}
            className="bg-slate-100/50 dark:bg-slate-800/50 p-1 block w-full"
            block
          />
        </motion.div>
      </div>

      {/* Grid Layout */}
      <div className="min-h-[400px]">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredTodos.length > 0 ? (
              filteredTodos.map(todo => (
                <TodoItem 
                  key={todo.id} 
                  todo={todo} 
                  onToggle={toggleTodo} 
                  onDelete={deleteTodo}
                  onEdit={updateTodo}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full flex flex-col justify-center items-center py-20"
              >
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description={
                    <span className="text-slate-500 dark:text-slate-400 text-lg">
                      {search ? "No tasks match your search" : 
                       filter !== 'All' ? `No ${filter.toLowerCase()} tasks found` : 
                       "You're all caught up! Add a new task to get started."}
                    </span>
                  } 
                />
                {!search && filter === 'All' && (
                  <div className="mt-6">
                    <AddTodoModal
                      onAdd={addTodo}
                      trigger={
                        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 shadow-lg">
                          Add your first task
                        </Button>
                      }
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="text-center text-slate-400 text-sm mt-8 pb-8">
        Showing {filteredTodos.length} of {todos.length} tasks • {todos.filter(t => t.completed).length} completed
      </div>
    </div>
  );
}
