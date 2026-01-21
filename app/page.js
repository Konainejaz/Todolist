"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { TodoApp } from "@/components/TodoApp";
import { CheckSquare, LogOut, User as UserIcon, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { LoginModal, SignupModal, ProfileModal, ForgotPasswordModal } from "@/components/AuthUI";
import { Button, message, Dropdown, Avatar } from "antd";

function HomeContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Session check failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      setUser(null);
      message.success("Logged out successfully");
    } catch (error) {
      message.error("Logout failed");
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setShowLogin(false);
        message.success("Logged in as Guest");
      } else {
        message.error(data.error || "Guest login failed");
      }
    } catch (error) {
      message.error("An error occurred");
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => setShowProfile(true),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Avatar className="bg-blue-600" icon={<UserIcon className="w-4 h-4" />} />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                      {user.isGuest ? 'Guest Account' : user.email}
                    </p>
                  </div>
                </div>
              </Dropdown>
            ) : (
              <Button 
                type="primary" 
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl font-medium"
              >
                Sign In
              </Button>
            )}
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

          {user ? (
            <TodoApp user={user} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl border border-white/10">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                <UserIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to organize your day?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md px-6">
                Sign in to your account or continue as a guest to start managing your tasks beautifully.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs px-6">
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  onClick={() => setShowLogin(true)}
                  className="bg-blue-600 h-12 text-lg rounded-xl"
                >
                  Sign In
                </Button>
                <Button 
                  size="large" 
                  block 
                  onClick={handleGuestLogin}
                  className="h-12 text-lg rounded-xl border-slate-200 dark:border-slate-700 dark:!text-white"
                >
                  Try as Guest
                </Button>
              </div>
            </div>
          )}
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

      {/* Auth Modals */}
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLoginSuccess={(u) => setUser(u)}
        onShowSignup={() => { setShowLogin(false); setShowSignup(true); }}
        onGuestLogin={handleGuestLogin}
        onShowForgotPassword={() => { setShowLogin(false); setShowForgotPassword(true); }}
      />
      <SignupModal 
        isOpen={showSignup} 
        onClose={() => setShowSignup(false)} 
        onSignupSuccess={(u) => setUser(u)}
        onShowLogin={() => { setShowSignup(false); setShowLogin(true); }}
      />
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onShowLogin={() => { setShowForgotPassword(false); setShowLogin(true); }}
      />
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        onUpdateSuccess={(u) => setUser(u)}
      />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
