import React, { useState, useEffect } from 'react';
import { Database, Cookie, Trash2, Plus, RefreshCw, Key, ShieldCheck, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StorageItem {
  key: string;
  value: string;
}

interface CookieItem {
  name: string;
  value: string;
}

export default function StorageInspector() {
  const [activeSubTab, setActiveSubTab] = useState<'local' | 'cookies'>('local');
  const [localStorageItems, setLocalStorageItems] = useState<StorageItem[]>([]);
  const [cookieItems, setCookieItems] = useState<CookieItem[]>([]);
  
  // Forms state
  const [newLSKey, setNewLSKey] = useState('');
  const [newLSValue, setNewLSValue] = useState('');
  const [newCookieName, setNewCookieName] = useState('');
  const [newCookieValue, setNewCookieValue] = useState('');
  const [newCookiePath, setNewCookiePath] = useState('/');

  // Success / error message indicators
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Helper to show a temporary feedback toast
  const triggerToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Refresh data
  const refreshStorage = () => {
    // 1. Fetch Local Storage
    const lsItems: StorageItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        lsItems.push({ key, value: localStorage.getItem(key) || '' });
      }
    }
    setLocalStorageItems(lsItems);

    // 2. Fetch Cookies
    const cookiesList: CookieItem[] = [];
    const rawCookies = document.cookie;
    if (rawCookies) {
      rawCookies.split(';').forEach(cookieStr => {
        const parts = cookieStr.trim().split('=');
        if (parts.length > 0 && parts[0]) {
          const name = parts[0];
          const value = parts.slice(1).join('='); // handle values that contain '='
          cookiesList.push({ name, value: decodeURIComponent(value) });
        }
      });
    }
    setCookieItems(cookiesList);
  };

  // Refresh on mount and set up automatic interval for live syncing
  useEffect(() => {
    refreshStorage();
    const interval = setInterval(refreshStorage, 2000); // Poll every 2 seconds to catch programmatic updates
    return () => clearInterval(interval);
  }, []);

  // Set Local Storage Item
  const handleSetLocalStorage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLSKey.trim()) return;

    try {
      localStorage.setItem(newLSKey.trim(), newLSValue);
      setNewLSKey('');
      setNewLSValue('');
      refreshStorage();
      triggerToast(`Set LocalStorage: "${newLSKey.trim()}"`);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Local Storage Item
  const handleDeleteLocalStorage = (key: string) => {
    localStorage.removeItem(key);
    refreshStorage();
    triggerToast(`Deleted LocalStorage key: "${key}"`, 'info');
  };

  // Clear all Local Storage (excluding theme and important framework stuff if possible, or just clear all)
  const handleClearLocalStorage = () => {
    const theme = localStorage.getItem('theme');
    localStorage.clear();
    // restore theme to prevent visual jarringness
    if (theme) {
      localStorage.setItem('theme', theme);
    }
    refreshStorage();
    triggerToast('Cleared LocalStorage (preserved theme preference)', 'info');
  };

  // Set Cookie
  const handleSetCookie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCookieName.trim()) return;

    const encodedValue = encodeURIComponent(newCookieValue);
    const pathSegment = newCookiePath ? `;path=${newCookiePath}` : ';path=/';
    // Expire in 1 day for simplicity
    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
    const expiresSegment = `;expires=${date.toUTCString()}`;

    document.cookie = `${newCookieName.trim()}=${encodedValue}${expiresSegment}${pathSegment}`;
    setNewCookieName('');
    setNewCookieValue('');
    setNewCookiePath('/');
    refreshStorage();
    triggerToast(`Cookie set: "${newCookieName.trim()}"`);
  };

  // Delete Cookie
  const handleDeleteCookie = (name: string) => {
    // Standard approach: set expiry to epoch time
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // also try without path just in case
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    refreshStorage();
    triggerToast(`Deleted cookie: "${name}"`, 'info');
  };

  // Clear all parsed cookies
  const handleClearCookies = () => {
    cookieItems.forEach(item => {
      document.cookie = `${item.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${item.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    });
    refreshStorage();
    triggerToast('Triggered cleanup on all visible cookies', 'info');
  };

  // Presets
  const applyPreset = (type: 'jwt' | 'admin' | 'user' | 'clear') => {
    if (type === 'jwt') {
      // Set JWT cookie
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfOTk4OCIsImVtYWlsIjoidGVzdEBzYW5kYm94LmNvbSIsInJvbGUiOiJkZXZlbG9wZXIiLCJleHAiOjE4MDAwMDAwMDB9.abcdefg-mock-token-signature';
      document.cookie = `session_token=${token};path=/;max-age=86400`;
      refreshStorage();
      triggerToast('Applied Preset: Secure JWT session_token Cookie');
    } else if (type === 'admin') {
      // Set Admin session object in localStorage
      const userObj = JSON.stringify({
        id: 'admin_usr_01',
        email: 'admin@sandbox-ingress.io',
        role: 'administrator',
        permissions: ['read', 'write', 'delete', 'bypass_recaptcha'],
        authenticatedAt: new Date().toISOString()
      }, null, 2);
      localStorage.setItem('auth_user_session', userObj);
      refreshStorage();
      triggerToast('Applied Preset: LocalStorage Admin Profile JSON');
    } else if (type === 'user') {
      // Set standard authenticated flag in localStorage
      localStorage.setItem('is_logged_in', 'true');
      localStorage.setItem('user_display_name', 'Alex Automation');
      localStorage.setItem('user_preference_layout', 'bento-grid');
      refreshStorage();
      triggerToast('Applied Preset: Basic User Session flags');
    } else if (type === 'clear') {
      handleClearLocalStorage();
      handleClearCookies();
    }
  };

  return (
    <div className="border-t border-stone-200/50 dark:border-stone-800/60 pt-8 mt-12" id="browser-storage-inspector">
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/80 rounded-2xl p-6 shadow-sm">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-100 dark:border-stone-800 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-base font-semibold font-display text-stone-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              Browser Storage & Auth Session Inspector
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
              Manually set, analyze, and purge client-side cookies and local storage state. Perfect for automating session-based tests or bypassing auth rules.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refreshStorage}
              id="storage-refresh-btn"
              data-testid="storage-refresh-btn"
              className="p-2 bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-900 border border-stone-200/40 dark:border-stone-800/50 rounded-xl text-stone-600 dark:text-stone-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Storage Logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Info
            </button>
            <button
              onClick={() => applyPreset('clear')}
              id="storage-purge-all-btn"
              data-testid="storage-purge-all-btn"
              className="p-2 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge All
            </button>
          </div>
        </div>

        {/* Auth Bypass Simulation Presets Panel */}
        <div className="bg-stone-50 dark:bg-stone-950 rounded-xl p-4 border border-stone-100 dark:border-stone-800/60 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-2.5">
            Automation Auth Presets (Instantly Inject Session State)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              id="preset-auth-cookie"
              data-testid="preset-auth-cookie"
              onClick={() => applyPreset('jwt')}
              className="py-2.5 px-3 bg-white dark:bg-stone-900 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 border border-stone-200 dark:border-stone-800 rounded-xl transition-all text-left flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1.5 bg-stone-100 dark:bg-stone-950 text-amber-500 rounded-lg shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Cookie className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">Inject JWT Cookie</p>
                <p className="text-[10px] text-stone-400 mt-0.5 truncate">Sets secure session_token cookie</p>
              </div>
            </button>

            <button
              type="button"
              id="preset-auth-local-admin"
              data-testid="preset-auth-local-admin"
              onClick={() => applyPreset('admin')}
              className="py-2.5 px-3 bg-white dark:bg-stone-900 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 border border-stone-200 dark:border-stone-800 rounded-xl transition-all text-left flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1.5 bg-stone-100 dark:bg-stone-950 text-amber-500 rounded-lg shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">Inject Admin LS Object</p>
                <p className="text-[10px] text-stone-400 mt-0.5 truncate">Sets auth_user_session JSON</p>
              </div>
            </button>

            <button
              type="button"
              id="preset-auth-local-flags"
              data-testid="preset-auth-local-flags"
              onClick={() => applyPreset('user')}
              className="py-2.5 px-3 bg-white dark:bg-stone-900 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 border border-stone-200 dark:border-stone-800 rounded-xl transition-all text-left flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1.5 bg-stone-100 dark:bg-stone-950 text-amber-500 rounded-lg shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">Inject User Auth Flags</p>
                <p className="text-[10px] text-stone-400 mt-0.5 truncate">Sets simple authentication variables</p>
              </div>
            </button>
          </div>
        </div>

        {/* Toast feedback indicator */}
        {toastMessage && (
          <div id="storage-toast-feedback" className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 animate-fade-in ${
            toastMessage.type === 'success' 
              ? 'bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-300' 
              : 'bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{toastMessage.text}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-stone-100 dark:border-stone-800/80 mb-6">
          <button
            onClick={() => setActiveSubTab('local')}
            id="tab-inspect-local"
            className={`py-3 px-4 font-display font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'local'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Local Storage ({localStorageItems.length})
          </button>
          <button
            onClick={() => setActiveSubTab('cookies')}
            id="tab-inspect-cookies"
            className={`py-3 px-4 font-display font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'cookies'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            Cookies ({cookieItems.length})
          </button>
        </div>

        {/* Local Storage Tab Panel */}
        {activeSubTab === 'local' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="panel-inspect-local">
            {/* Left Col: Setup Form */}
            <div className="bg-stone-50 dark:bg-stone-950 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 flex flex-col justify-between">
              <form onSubmit={handleSetLocalStorage} className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-1">
                    <Plus className="w-3.5 h-3.5 text-amber-500" />
                    Set New LocalStorage Item
                  </h4>
                  <p className="text-[10px] text-stone-400">Stores key-value data on local origins.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="ls-key-input" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Key Name</label>
                    <input
                      type="text"
                      id="ls-key-input"
                      data-testid="ls-key-input"
                      value={newLSKey}
                      onChange={(e) => setNewLSKey(e.target.value)}
                      placeholder="e.g. auth_user_session"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-stone-800 dark:text-stone-100"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="ls-val-input" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Value (or JSON string)</label>
                    <textarea
                      id="ls-val-input"
                      data-testid="ls-val-input"
                      value={newLSValue}
                      onChange={(e) => setNewLSValue(e.target.value)}
                      placeholder='e.g. {"id": 1, "name": "Alex"}'
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono text-stone-800 dark:text-stone-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="add-ls-item-btn"
                  data-testid="add-ls-item-btn"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Save Item to State
                </button>
              </form>
            </div>

            {/* Right Col: Active items grid (Spans 2 columns) */}
            <div className="lg:col-span-2 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              {localStorageItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-stone-400 flex-1 min-h-[220px]">
                  <Database className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-semibold">No LocalStorage values set on this origin</p>
                  <p className="text-[10px] mt-0.5">Use the setup panel or automation presets to inject mock items.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
                    <table className="w-full text-left border-collapse" id="ls-inspector-table">
                      <thead>
                        <tr className="bg-stone-50/50 dark:bg-stone-950/40 border-b border-stone-100 dark:border-stone-800/80 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Key Name</th>
                          <th className="py-3 px-4">Stored Value</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-mono text-xs">
                        {localStorageItems.map((item) => (
                          <tr key={item.key} className="hover:bg-stone-50/30 dark:hover:bg-stone-950/20 transition-colors">
                            <td className="py-2.5 px-4 font-bold text-stone-700 dark:text-stone-300 max-w-[150px] truncate" title={item.key}>
                              {item.key}
                            </td>
                            <td className="py-2.5 px-4 text-stone-500 dark:text-stone-400 max-w-[280px] truncate" title={item.value}>
                              {item.value}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteLocalStorage(item.key)}
                                className="p-1.5 text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-lg transition-all cursor-pointer inline-flex items-center"
                                title={`Delete ${item.key}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-stone-50/30 dark:bg-stone-950/20 p-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Total Elements: <strong>{localStorageItems.length}</strong></span>
                    <button
                      type="button"
                      onClick={handleClearLocalStorage}
                      id="clear-all-ls-btn"
                      className="text-red-500 dark:text-red-400 hover:underline font-semibold cursor-pointer"
                    >
                      Clear LocalStorage
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cookies Tab Panel */}
        {activeSubTab === 'cookies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="panel-inspect-cookies">
            {/* Left Col: Setup Form */}
            <div className="bg-stone-50 dark:bg-stone-950 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 flex flex-col justify-between">
              <form onSubmit={handleSetCookie} className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-1">
                    <Plus className="w-3.5 h-3.5 text-amber-500" />
                    Bake New Active Cookie
                  </h4>
                  <p className="text-[10px] text-stone-400">Adds key-value pairs to the browser document.cookie store.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="cookie-name-input" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Cookie Name</label>
                    <input
                      type="text"
                      id="cookie-name-input"
                      data-testid="cookie-name-input"
                      value={newCookieName}
                      onChange={(e) => setNewCookieName(e.target.value)}
                      placeholder="e.g. session_token"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-stone-800 dark:text-stone-100"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="cookie-val-input" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Cookie Value</label>
                    <input
                      type="text"
                      id="cookie-val-input"
                      data-testid="cookie-val-input"
                      value={newCookieValue}
                      onChange={(e) => setNewCookieValue(e.target.value)}
                      placeholder="e.g. abcd-1234-jwt"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono text-stone-800 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="cookie-path-input" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Path Target (optional)</label>
                    <input
                      type="text"
                      id="cookie-path-input"
                      value={newCookiePath}
                      onChange={(e) => setNewCookiePath(e.target.value)}
                      placeholder="e.g. /"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-stone-800 dark:text-stone-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="add-cookie-btn"
                  data-testid="add-cookie-btn"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Bake Secure Cookie
                </button>
              </form>
            </div>

            {/* Right Col: Active items grid */}
            <div className="lg:col-span-2 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              {cookieItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-stone-400 flex-1 min-h-[220px]">
                  <Cookie className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-semibold">No visible active cookies parsed</p>
                  <p className="text-[10px] mt-0.5">Note: Cookies set with 'HttpOnly' flags cannot be accessed or inspected by client-side JavaScript.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
                    <table className="w-full text-left border-collapse" id="cookies-inspector-table">
                      <thead>
                        <tr className="bg-stone-50/50 dark:bg-stone-950/40 border-b border-stone-100 dark:border-stone-800/80 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Cookie Name</th>
                          <th className="py-3 px-4">Assigned Value</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-mono text-xs">
                        {cookieItems.map((item) => (
                          <tr key={item.name} className="hover:bg-stone-50/30 dark:hover:bg-stone-950/20 transition-colors">
                            <td className="py-2.5 px-4 font-bold text-stone-700 dark:text-slate-300 max-w-[150px] truncate" title={item.name}>
                              {item.name}
                            </td>
                            <td className="py-2.5 px-4 text-stone-500 dark:text-stone-400 max-w-[280px] truncate" title={item.value}>
                              {item.value}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteCookie(item.name)}
                                className="p-1.5 text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-lg transition-all cursor-pointer inline-flex items-center"
                                title={`Delete Cookie: ${item.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-stone-50/30 dark:bg-stone-950/20 p-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Active Cookies: <strong>{cookieItems.length}</strong></span>
                    <button
                      type="button"
                      onClick={handleClearCookies}
                      id="clear-all-cookies-btn"
                      className="text-red-500 dark:text-red-400 hover:underline font-semibold cursor-pointer"
                    >
                      Delete All Cookies
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
