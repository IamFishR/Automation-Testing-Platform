import React, { useState, useEffect } from 'react';
import { Play, Shield, Database, Layers, Monitor, Terminal, CheckCircle2, ChevronRight, Copy, Check, HeartHandshake, GitMerge } from 'lucide-react';
import { PageId } from '../types';

interface HomeOverviewProps {
  setActiveTab: (tab: PageId) => void;
}

export default function HomeOverview({ setActiveTab }: HomeOverviewProps) {
  const [appUrl, setAppUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAppUrl(window.location.origin);
  }, []);

  const challengeCards = [
    {
      id: 'forms',
      title: 'Input Forms & Fields',
      desc: 'Verify text fields, selection boxes, state sequences (locked dependencies), and traverse dynamic randomized ID attributes.',
      difficulty: 'Beginner - Advanced',
      icon: Shield,
      color: 'text-amber-500 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/50'
    },
    {
      id: 'tables',
      title: 'Dynamic Data Tables',
      desc: 'Test query filters, sorting logic, paginated rows, row additions/deletions, and synchronizing wait states for API lag simulation.',
      difficulty: 'Intermediate',
      icon: Database,
      color: 'text-stone-300 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/50'
    },
    {
      id: 'dynamic',
      title: 'Elusive & Overlapping Elements',
      desc: 'Verify timed injection delays, short-lived disappearing alerts, rotary state strings, and z-index click interception overlays.',
      difficulty: 'Intermediate - Advanced',
      icon: Layers,
      color: 'text-amber-500 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/50'
    },
    {
      id: 'shadow-iframe',
      title: 'Shadow DOM & IFrames',
      desc: 'Test boundary traversals. Pierce open/closed custom Shadow trees and switch contexts safely to input into sandboxed document nodes.',
      difficulty: 'Advanced - Expert',
      icon: Monitor,
      color: 'text-stone-300 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/50'
    },
    {
      id: 'flows',
      title: 'E2E Flows Gateway',
      desc: 'Chains multi-step security credentials, cellular OTP codes, corporate configuration forms, real-time credit card processing, and live back-office databases.',
      difficulty: 'Expert',
      icon: GitMerge,
      color: 'text-amber-500 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/50'
    }
  ] as const;

  const boilerplatePlaywright = `// example_test.spec.ts
import { test, expect } from '@playwright/test';

test('UI Automation Playground Core Assertions', async ({ page }) => {
  // 1. Visit your custom sandboxed URL
  await page.goto('${appUrl || 'https://example.com'}');

  // 2. Navigate to Form Challenges
  await page.click('button#nav-link-forms');

  // 3. Fill out the validation form
  await page.fill('input[data-testid="username-input"]', 'tester123');
  await page.fill('input[data-testid="email-input"]', 'test@automation.org');
  await page.fill('input[data-testid="age-input"]', '28');
  await page.check('input[data-testid="terms-checkbox"]');
  
  // 4. Click submit & verify completion
  await page.click('button#submit-validation-form');
  const banner = page.locator('#form-success-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Validation Passed');
});`;

  const handleCopy = () => {
    navigator.clipboard.writeText(boilerplatePlaywright);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="home-overview-root" className="space-y-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        {/* Dynamic Abstract background graphics */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-stone-500/10 rounded-full blur-2xl -mb-10 pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="px-3 py-1 text-[10px] font-mono bg-stone-800 text-amber-400 rounded-full font-semibold border border-stone-700">
            QA AUTOMATION SANDBOX V1.0
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-stone-100">
            Hone Your Advanced Web Automation Skills
          </h1>
          <p className="text-sm md:text-base text-stone-300 leading-relaxed">
            Welcome to the ultimate testing sandbox designed exclusively for web automation engineers. Practice locator traversals, deal with tricky asynchronous states, pierce open/closed shadow boundaries, and handle z-index click interception exceptions.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="start-forms-btn"
              onClick={() => setActiveTab('forms')}
              className="bg-amber-500 hover:bg-amber-400 font-semibold text-stone-950 px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Enter Sandbox Arenas</span>
            </button>
            <button
              id="start-guides-btn"
              onClick={() => setActiveTab('guides')}
              className="bg-stone-800 hover:bg-stone-700 font-semibold text-stone-300 hover:text-white px-5 py-2.5 rounded-xl text-xs transition-all border border-stone-700 cursor-pointer"
            >
              <span>View Boilerplate Recipes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target URL Alert Box */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
            Your Live Sandbox Testing Target
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
            Point your local Playwright, Selenium, or Cypress scripts directly to this host endpoint to execute assertions live:
          </p>
        </div>
        <div className="bg-stone-50 dark:bg-stone-950 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-3 justify-between font-mono text-xs text-amber-600 dark:text-amber-400 max-w-full overflow-x-auto shrink-0 select-all">
          <span id="target-url-display" className="font-semibold">{appUrl || 'Retrieving...'}</span>
        </div>
      </div>

      {/* Grid of Challenges */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold font-display text-stone-900 dark:text-white flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-amber-500" />
          Available Practice Challenges
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challengeCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                id={`challenge-card-${card.id}`}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 flex flex-col justify-between hover:border-amber-500/40 dark:hover:border-stone-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 font-mono tracking-wider uppercase">
                      {card.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-white mt-4 font-display">
                    {card.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <button
                  id={`enter-${card.id}-btn`}
                  onClick={() => setActiveTab(card.id)}
                  className="mt-5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer w-fit group-hover:translate-x-1 transition-transform"
                >
                  <span>Open Arena</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quickstart Code Block */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        
        {/* Editor Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-950/20">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-white text-sm">
                Get Testing Instantly (Playwright Quickstart)
              </h3>
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                A simple test to copy, run locally, and watch elements interact!
              </p>
            </div>
          </div>

          <button
            id="copy-quickstart-btn"
            onClick={handleCopy}
            className="p-2 text-stone-400 hover:text-amber-500 dark:text-stone-500 dark:hover:text-amber-400 bg-white dark:bg-stone-800 rounded-lg shadow-sm hover:bg-stone-100 dark:hover:bg-stone-700 transition-all border border-stone-200 dark:border-stone-700 shrink-0 cursor-pointer"
            title="Copy Quickstart Script"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Code Block */}
        <div className="bg-stone-950 p-5 font-mono text-xs overflow-x-auto text-stone-300 leading-relaxed select-text">
          <pre className="whitespace-pre">
            <code>{boilerplatePlaywright}</code>
          </pre>
        </div>
      </div>

    </div>
  );
}
