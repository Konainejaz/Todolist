"use client"

import { TodoApp } from "@/components/TodoApp";
import { CheckSquare, Layers, Layout, Github, Twitter } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden flex flex-col">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 dark:border-slate-800/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">Task</span>
              <span className="text-blue-600 dark:text-blue-400">Master</span>
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <div className="mb-10 md:mb-14 text-center md:text-left space-y-4">
             <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
              Manage your work <br className="hidden md:block" />
              <span className="text-gradient">efficiently & beautifully.</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl md:max-w-3xl">
              A powerful, task management workspace designed for clarity and focus. 
              Organize your daily goals with style.
            </p>
          </div>

          <TodoApp />
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="glass border-t border-white/10 dark:border-slate-800/50 mt-auto z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col justify-center items-center text-center gap-4">
            <div className="text-slate-600 dark:text-slate-400">
              <p className="text-sm font-medium">© {new Date().getFullYear()} Developed by Quonain</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
