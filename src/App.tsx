import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Play, Terminal, HelpCircle, Flame } from 'lucide-react';
import Navigation from './components/Navigation';
import HomeOverview from './components/HomeOverview';
import FormChallenges from './components/FormChallenges';
import DataTableChallenges from './components/DataTableChallenges';
import DynamicElementChallenges from './components/DynamicElementChallenges';
import ShadowIFrameChallenges from './components/ShadowIFrameChallenges';
import AutomationGuides from './components/AutomationGuides';
import IntegratedFlows from './components/IntegratedFlows';
import { PageId } from './types';
import StorageInspector from './components/StorageInspector';
import NetworkTracker from './components/NetworkTracker';

export default function App() {
  const [activeTab, setActiveTab] = useState<PageId>('home');
  const [darkMode, setDarkMode] = useState(false);
  const [sessionEvents, setSessionEvents] = useState<string[]>([]);

  // Theme Sync on Mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Set up global session event listener for testing telemetry log
    const pushEvent = (msg: string) => {
      setSessionEvents(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 4)]);
    };

    pushEvent('Automation Sandbox Engine initialized.');

    // Watch clicks and custom inputs to populate the session log
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.id) {
        if (target.id.includes('btn') || target.id.includes('submit')) {
          pushEvent(`Interacted with element: id="${target.id}"`);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeOverview setActiveTab={setActiveTab} />;
      case 'forms':
        return <FormChallenges />;
      case 'tables':
        return <DataTableChallenges />;
      case 'dynamic':
        return <DynamicElementChallenges />;
      case 'shadow-iframe':
        return <ShadowIFrameChallenges />;
      case 'flows':
        return <IntegratedFlows />;
      case 'guides':
        return <AutomationGuides />;
      default:
        return <HomeOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col lg:flex-row font-sans transition-colors duration-200">
      
      {/* Dynamic Nav Header / Sidebar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Scaffold */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
          
          {/* Core Challenge Interface */}
          <div className="flex-1">
            {renderContent()}
          </div>

          {/* Browser Storage Inspector */}
          <StorageInspector />

          {/* Network Request Tracker */}
          <NetworkTracker />

          {/* Global Footer & Live Telemetry Logger (Gives absolute architectural honesty and helper logs for automation) */}
          <footer className="border-t border-stone-200/50 dark:border-stone-800/60 pt-6 pb-12 mt-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Branding Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-stone-900 dark:text-white font-display font-semibold text-sm">
                  <Cpu className="w-4 h-4 text-amber-500" />
                  <span>Sandbox Ingress Node</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
                  A high-fidelity compliance web playground designed to challenge assertions, test visibility triggers, and exercise advanced web scrapers and automation suites.
                </p>
              </div>

              {/* Test Framework Anchors */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                  Supported Drivers
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Playwright', 'Selenium', 'Cypress', 'Puppeteer', 'WebdriverIO'].map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200/40 dark:border-stone-800/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Telemetry Console Logger */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Sandbox Console Telemetry
                </span>
                <div
                  id="telemetry-log"
                  className="bg-stone-950 rounded-xl p-3 border border-stone-800 font-mono text-[10px] text-amber-400 space-y-1.5 max-h-[100px] overflow-y-auto"
                >
                  {sessionEvents.map((ev, index) => (
                    <div key={index} className="truncate select-text">
                      <span className="text-stone-600">&gt;</span> {ev}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sub Footer Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-stone-100 dark:border-stone-900 text-[11px] text-stone-400">
              <span>&copy; {new Date().getFullYear()} UI Automation Playground. Sandbox container active.</span>
              <div className="flex gap-4">
                <a href="#app-root" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">Back to top</a>
                <span>•</span>
                <button onClick={() => setActiveTab('guides')} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer">Testing Recipes</button>
              </div>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
