import React, { useEffect, useState } from 'react';
import { HelpCircle, Layers, Monitor, ExternalLink, ShieldCheck } from 'lucide-react';

// Define Custom Web Components inside React Module or verify on Mount
class OpenShadowElement extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <div style="font-family: 'Inter', sans-serif; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.05em;">Open Shadow DOM</p>
          <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748b;">Pierced by standard CSS in modern engines.</p>
          
          <label style="display: block; font-size: 11px; font-weight: 600; color: #334155; margin-bottom: 4px;">Secret Code Name</label>
          <input id="open-shadow-input" placeholder="Enter codename..." style="font-size: 13px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; width: calc(100% - 26px); margin-bottom: 12px; outline: none;" />
          
          <button id="open-shadow-submit" style="background: #4f46e5; color: white; border: none; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: background 0.2s;">Validate Code</button>
          <p id="open-shadow-result" style="margin: 8px 0 0 0; font-size: 12px; color: #10b981; font-weight: 600; display: none; align-items: center; gap: 4px;">✓ Open Shadow Cleared!</p>
        </div>
      `;

      const btn = shadow.querySelector('#open-shadow-submit');
      const input = shadow.querySelector('#open-shadow-input') as HTMLInputElement;
      const result = shadow.querySelector('#open-shadow-result') as HTMLElement;

      btn?.addEventListener('click', () => {
        if (input && input.value.trim().length > 0) {
          result.style.display = 'flex';
        }
      });
    }
  }
}

class ClosedShadowElement extends HTMLElement {
  private _closedRoot: ShadowRoot | null = null;
  connectedCallback() {
    if (!this._closedRoot) {
      const shadow = this.attachShadow({ mode: 'closed' });
      this._closedRoot = shadow;
      // Expose a secret backdoor for testing scripts to discover
      (this as any)._closedRoot = shadow;

      shadow.innerHTML = `
        <div style="font-family: 'Inter', sans-serif; padding: 16px; background: #fff5f5; border-radius: 12px; border: 1px solid #fee2e2;">
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #dc2626; text-transform: uppercase; letter-spacing: 0.05em;">Closed Shadow DOM</p>
          <p style="margin: 0 0 12px 0; font-size: 11px; color: #b91c1c;">Hidden from outer querySelector. Piercing blocked.</p>
          
          <label style="display: block; font-size: 11px; font-weight: 600; color: #991b1b; margin-bottom: 4px;">Override Cipher Key</label>
          <input id="closed-shadow-input" placeholder="Enter key..." style="font-size: 13px; padding: 8px 12px; border: 1px solid #fca5a5; border-radius: 8px; width: calc(100% - 26px); margin-bottom: 12px; outline: none; background: white;" />
          
          <button id="closed-shadow-submit" style="background: #dc2626; color: white; border: none; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: background 0.2s;">Force Override</button>
          <p id="closed-shadow-result" style="margin: 8px 0 0 0; font-size: 12px; color: #b91c1c; font-weight: 600; display: none; align-items: center; gap: 4px;">✓ Closed Shadow Decoded!</p>
        </div>
      `;

      const btn = shadow.querySelector('#closed-shadow-submit');
      const input = shadow.querySelector('#closed-shadow-input') as HTMLInputElement;
      const result = shadow.querySelector('#closed-shadow-result') as HTMLElement;

      btn?.addEventListener('click', () => {
        if (input && input.value.trim().length > 0) {
          result.style.display = 'flex';
        }
      });
    }
  }
}

export default function ShadowIFrameChallenges() {
  const [themeMode, setThemeMode] = useState('light');

  useEffect(() => {
    // Detect dark mode to pass preferences into the dynamically constructed iframe doc
    const isDark = document.documentElement.classList.contains('dark');
    setThemeMode(isDark ? 'dark' : 'light');

    // Register Web Components once safely
    if (!customElements.get('open-shadow-element')) {
      customElements.define('open-shadow-element', OpenShadowElement);
    }
    if (!customElements.get('closed-shadow-element')) {
      customElements.define('closed-shadow-element', ClosedShadowElement);
    }

    // Safely append custom elements to containers to bypass JSX compilation restrictions
    const openContainer = document.getElementById('open-shadow-challenge-host-container');
    if (openContainer && openContainer.children.length === 0) {
      const el = document.createElement('open-shadow-element');
      el.setAttribute('id', 'open-shadow-challenge-host');
      openContainer.appendChild(el);
    }

    const closedContainer = document.getElementById('closed-shadow-challenge-host-container');
    if (closedContainer && closedContainer.children.length === 0) {
      const el = document.createElement('closed-shadow-element');
      el.setAttribute('id', 'closed-shadow-challenge-host');
      closedContainer.appendChild(el);
    }
  }, []);

  // Frame HTML definition with style triggers
  const iframeContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            margin: 0;
            padding: 16px;
            background-color: ${themeMode === 'dark' ? '#020617' : '#fafafa'};
            color: ${themeMode === 'dark' ? '#f1f5f9' : '#0f172a'};
            transition: all 0.2s;
          }
          .card {
            border: 1px solid ${themeMode === 'dark' ? '#1e293b' : '#e2e8f0'};
            background: ${themeMode === 'dark' ? '#0f172a' : '#ffffff'};
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: ${themeMode === 'dark' ? '#38bdf8' : '#0284c7'};
          }
          p {
            margin: 0 0 16px 0;
            font-size: 11px;
            color: ${themeMode === 'dark' ? '#94a3b8' : '#64748b'};
          }
          label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 6px;
            color: ${themeMode === 'dark' ? '#cbd5e1' : '#334155'};
          }
          input {
            width: calc(100% - 24px);
            padding: 8px 12px;
            border: 1px solid ${themeMode === 'dark' ? '#334155' : '#cbd5e1'};
            border-radius: 8px;
            margin-bottom: 12px;
            font-size: 13px;
            outline: none;
            background: ${themeMode === 'dark' ? '#020617' : '#ffffff'};
            color: inherit;
          }
          button {
            background: ${themeMode === 'dark' ? '#38bdf8' : '#0284c7'};
            color: ${themeMode === 'dark' ? '#020617' : '#ffffff'};
            border: none;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          button:hover {
            opacity: 0.9;
          }
          .success {
            display: none;
            margin-top: 10px;
            font-size: 12px;
            font-weight: 600;
            color: #10b981;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h4>Frame Sandbox Scope</h4>
          <p>Context switched! You are inside an encapsulated iframe node.</p>
          
          <label for="frame-user-input">User Authentication Token</label>
          <input id="frame-user-input" type="text" placeholder="Type access-token..." />
          
          <button id="frame-submit-btn" onclick="validateToken()">Verify IFrame Access</button>
          <p id="frame-result-message" class="success">✓ Success! Dynamic IFrame context correctly accessed.</p>
        </div>

        <script>
          function validateToken() {
            const input = document.getElementById('frame-user-input');
            const result = document.getElementById('frame-result-message');
            if (input && input.value.trim().length > 0) {
              result.style.display = 'block';
            }
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div id="encapsulated-challenges-root" className="space-y-8">
      {/* Overview Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm">
        <h2 className="text-2xl font-semibold font-display text-stone-900 dark:text-white flex items-center gap-2">
          <Monitor className="w-6 h-6 text-amber-500" />
          Shadow DOM & IFrame Contexts
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Simulate cross-origin boundaries, separate execution trees, and hidden tree structures. These components isolate their elements, preventing standard document queries and demanding advanced selector parsing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Shadow DOM Arena */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xs p-6 flex flex-col space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-stone-50 dark:border-stone-800">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                Advanced / Expert
              </span>
              <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2">
                Shadow DOM Challenges
              </h3>
            </div>
            <Layers className="w-5 h-5 text-purple-500" />
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            The elements inside these containers are isolated inside custom shadow hosts. 
            Open shadow roots allow standard piercing, but closed shadow roots require evaluating custom javascript paths.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Open Shadow Anchor */}
            <div id="open-shadow-container" className="space-y-2">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Open Shadow Element</span>
              <div id="open-shadow-challenge-host-container"></div>
            </div>

            {/* Closed Shadow Anchor */}
            <div id="closed-shadow-container" className="space-y-2">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Closed Shadow Element</span>
              <div id="closed-shadow-challenge-host-container"></div>
            </div>

          </div>

          <div className="bg-stone-50/50 dark:bg-stone-950/10 border border-stone-100/30 dark:border-amber-900/30 rounded-xl p-4 text-xs text-stone-600 dark:text-stone-400 space-y-2">
            <h4 className="font-semibold text-stone-800 dark:text-stone-200">How to automate:</h4>
            <p>
              • <strong>Playwright:</strong> Traverses Open roots natively! For example, <code>page.locator('input#open-shadow-input')</code> will resolve immediately.
            </p>
            <p>
              • <strong>Selenium / Closed roots:</strong> Access the closed backdoor element inside our script evaluates: <code>host._closedRoot.querySelector('input')</code>.
            </p>
          </div>
        </div>

        {/* IFrame Context Arena */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xs p-6 flex flex-col space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-stone-50 dark:border-stone-800">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30">
                Advanced
              </span>
              <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2">
                IFrame Integration Contexts
              </h3>
            </div>
            <ExternalLink className="w-5 h-5 text-sky-500" />
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            The panel below is a real independent sandbox frame. An automated test script must switch focus context onto the IFrame tree (by target selector ID) before locating the input element.
          </p>

          <div id="iframe-target-container" className="w-full">
            <iframe
              id="testing-iframe"
              data-testid="challenge-iframe"
              title="Automation Target Frame"
              className="w-full h-[220px] rounded-2xl border border-stone-200 dark:border-stone-800"
              srcDoc={iframeContent}
            />
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/30 rounded-xl p-4 text-xs text-emerald-800 dark:text-emerald-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <strong>Verify Switch context:</strong>
              <p className="mt-0.5">Automated scripts must use <code>page.frameLocator('#testing-iframe')</code> or equivalent drivers to input authentication, then click the verification button.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
