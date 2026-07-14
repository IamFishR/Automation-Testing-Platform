import React, { useState } from 'react';
import { Menu, X, Sun, Moon, Terminal, Shield, Database, Layers, Monitor, Award, HeartHandshake, GitMerge, Cpu } from 'lucide-react';
import { PageId } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavigationProps {
  activeTab: PageId;
  setActiveTab: (tab: PageId) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Navigation({ activeTab, setActiveTab, darkMode, setDarkMode }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Intro & Arena Info', icon: HeartHandshake },
    { id: 'forms', label: 'Input Forms', icon: Shield },
    { id: 'tables', label: 'Data Tables', icon: Database },
    { id: 'dynamic', label: 'Dynamic & Overlays', icon: Layers },
    { id: 'shadow-iframe', label: 'Shadow DOM & IFrames', icon: Monitor },
    { id: 'flows', label: 'E2E Flows Gateway', icon: GitMerge },
    { id: 'guides', label: 'Automation Recipes', icon: Terminal }
  ] as const;

  const toggleTheme = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    if (newVal) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
        id="desktop-sidebar"
        className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-stone-900 border-r border-stone-800 text-stone-200 transition-colors"
      >
        {/* Header Logo */}
        <div className="p-6 border-b border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-100 shadow-sm" id="app-logo">
            <Terminal className="w-5 h-5 font-semibold text-amber-500" />
          </div>
          <div>
            <span className="font-display font-bold text-stone-100 text-sm tracking-tight block">
              QA Sandbox
            </span>
            <span className="text-[9px] text-amber-500 font-mono tracking-wider font-semibold block uppercase mt-0.5">
              Automation Arena
            </span>
          </div>
        </div>

        {/* Navigation Items (Vertical List) */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full relative px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer group text-left ${
                  isActive
                    ? 'text-stone-100'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-pill-active"
                    className="absolute inset-0 bg-stone-800 border border-stone-700/50 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <IconComp className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-amber-500' : 'text-stone-500 group-hover:text-stone-400'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-stone-800 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] text-stone-500 font-mono">Theme Mode</span>
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-all cursor-pointer border border-stone-800"
              title="Toggle Theme"
            >
              {darkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-stone-300" />
              )}
            </button>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-950/40 border border-stone-800/60 flex items-center gap-2 text-[10px] text-stone-500 font-mono">
            <Cpu className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Sandbox Node: Active</span>
          </div>
        </div>
      </aside>

      {/* --- MOBILE HEADER & DROPDOWN --- */}
      <header 
        id="mobile-header"
        className="lg:hidden sticky top-0 z-50 bg-stone-900 border-b border-stone-800 text-stone-200 transition-colors"
      >
        <div className="px-4 py-3.5 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-100 shadow-sm" id="mobile-app-logo">
              <Terminal className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div>
              <span className="font-display font-bold text-stone-100 text-sm leading-none block">
                QA Sandbox
              </span>
              <span className="text-[8px] text-amber-500 font-mono tracking-wider font-semibold block uppercase mt-0.5">
                Automation Arena
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn-mobile"
              onClick={toggleTheme}
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-all cursor-pointer border border-transparent"
              title="Toggle Theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-300" />
              )}
            </button>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-stone-400 hover:bg-stone-800 rounded-xl transition-all cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu-drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="border-t border-stone-800 bg-stone-900 overflow-hidden"
            >
              <div className="px-3 pt-2 pb-4 space-y-1 bg-stone-900">
                {menuItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`mobile-nav-link-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-stone-800 text-stone-100 border border-stone-700/50'
                          : 'text-stone-400 hover:bg-stone-800/40 hover:text-stone-200'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-500' : 'text-stone-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
