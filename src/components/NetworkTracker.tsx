import React, { useState, useEffect } from 'react';
import { networkInterceptor } from '../utils/networkInterceptor';
import { NetworkLog, MockRule } from '../types';
import { 
  Globe, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Play, 
  Check, 
  Settings, 
  AlertCircle, 
  Activity, 
  Clock, 
  ArrowRight,
  Eye,
  EyeOff,
  Code,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function NetworkTracker() {
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [rules, setRules] = useState<MockRule[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'rules'>('logs');
  
  // New Rule Form
  const [newPattern, setNewPattern] = useState('');
  const [newStatus, setNewStatus] = useState<number>(200);
  const [newBody, setNewBody] = useState('{"success": true}');
  const [newDelay, setNewDelay] = useState<number>(200);
  const [ruleError, setRuleError] = useState('');

  // Diagnostic Request Trigger
  const [testUrl, setTestUrl] = useState('/api/v1/auth/session');
  const [testMethod, setTestMethod] = useState('GET');
  const [testBody, setTestBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Selected Log for inspector modal/details
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time events from interceptor
    const unsubscribeLogs = networkInterceptor.subscribeLogs((newLogs) => {
      setLogs(newLogs);
    });

    const unsubscribeRules = networkInterceptor.subscribeRules((newRules) => {
      setRules(newRules);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeRules();
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleRule = (id: string) => {
    networkInterceptor.toggleRule(id);
    triggerToast('Interception rule status updated!');
  };

  const handleDeleteRule = (id: string) => {
    networkInterceptor.deleteRule(id);
    triggerToast('Mock rule deleted');
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    setRuleError('');

    if (!newPattern.trim()) {
      setRuleError('URL pattern cannot be empty');
      return;
    }

    try {
      // Validate JSON if status or body looks like JSON
      if (newBody.trim()) {
        JSON.parse(newBody);
      }
    } catch (err) {
      setRuleError('Response body must be valid JSON');
      return;
    }

    const rule: MockRule = {
      id: `rule-${Math.random().toString(36).substring(2, 9)}`,
      urlPattern: newPattern.trim(),
      status: Number(newStatus),
      responseBody: newBody.trim(),
      enabled: true,
      delayMs: Number(newDelay) || 0
    };

    networkInterceptor.addRule(rule);
    setNewPattern('');
    setNewStatus(200);
    setNewBody('{"success": true}');
    setNewDelay(200);
    triggerToast('Interception rule registered!');
  };

  const handleClearLogs = () => {
    networkInterceptor.clearLogs();
    triggerToast('Network logs cleared');
  };

  const handleTriggerFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const options: RequestInit = {
        method: testMethod,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'SandboxNetworkTracker'
        }
      };

      if (testMethod !== 'GET' && testMethod !== 'HEAD' && testBody.trim()) {
        options.body = testBody;
      }

      // Fire the fetch! Our interceptor automatically intercepts this call.
      const res = await fetch(testUrl, options);
      // We consume response so fetch resolves fully
      await res.text();
    } catch (err: any) {
      console.warn('Sandbox fetch triggered error (expected if mocked to fail):', err.message);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status: number | undefined) => {
    if (status === undefined) return 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700';
    if (status === 0) return 'bg-red-50/50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
    if (status >= 200 && status < 300) return 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800/60 dark:text-stone-300 dark:border-stone-700';
    if (status >= 300 && status < 400) return 'bg-amber-50/50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    if (status >= 400 && status < 500) return 'bg-orange-50/50 text-orange-700 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30';
    return 'bg-red-50/50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
  };

  return (
    <div className="border-t border-stone-200/50 dark:border-stone-800/60 pt-8 mt-8" id="network-request-tracker">
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/80 rounded-2xl p-6 shadow-sm">
        
        {/* Title / Summary Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-100 dark:border-stone-800 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-base font-semibold font-display text-stone-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-500 animate-pulse" />
              Dynamic Network Request Tracker & API Interceptor
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
              Intercept outbound <code>window.fetch</code> calls, inspect payloads, and configure live API mock interceptors to bypass or simulate edge cases.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearLogs}
              id="net-clear-logs-btn"
              data-testid="net-clear-logs-btn"
              className="p-2 bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-900 border border-stone-200/40 dark:border-stone-800/50 rounded-xl text-stone-600 dark:text-stone-400 hover:text-red-500 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Logs
            </button>
          </div>
        </div>

        {/* Global Toast Feed */}
        {toast && (
          <div id="net-toast-feedback" className="p-3 bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/50 rounded-xl text-stone-800 dark:text-stone-300 text-xs flex items-center gap-2 mb-4 animate-fade-in">
            <Check className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold">{toast}</span>
          </div>
        )}

        {/* Subtabs Controls */}
        <div className="flex border-b border-stone-100 dark:border-stone-800/80 mb-6">
          <button
            onClick={() => setActiveSubTab('logs')}
            id="tab-net-logs"
            className={`py-3 px-4 font-display font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'logs'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Outbound Traffic Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            id="tab-net-rules"
            className={`py-3 px-4 font-display font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'rules'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            API Mock Interceptors ({rules.length})
          </button>
        </div>

        {/* Traffic Logs Panel */}
        {activeSubTab === 'logs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="panel-net-logs">
            
            {/* Outbound Simulator Console (Left col) */}
            <div className="bg-stone-50 dark:bg-stone-950 rounded-2xl p-5 border border-stone-100 dark:border-stone-800/50 flex flex-col justify-between">
              <form onSubmit={handleTriggerFetch} className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-1">
                    <Play className="w-3.5 h-3.5 text-amber-500" />
                    Diagnostics Trigger Console
                  </h4>
                  <p className="text-[10px] text-stone-400">Dispatch a mock fetch request to verify live rules and check status results.</p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label htmlFor="test-method" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Method</label>
                      <select
                        id="test-method"
                        value={testMethod}
                        onChange={(e) => setTestMethod(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="test-url" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Request Path</label>
                      <input
                        type="text"
                        id="test-url"
                        data-testid="test-url"
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        placeholder="e.g. /api/v1/auth/session"
                        className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {testMethod !== 'GET' && (
                    <div>
                      <label htmlFor="test-body" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Request Body (JSON)</label>
                      <textarea
                        id="test-body"
                        value={testBody}
                        onChange={(e) => setTestBody(e.target.value)}
                        placeholder='{"name": "test"}'
                        rows={2}
                        className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 font-mono focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  id="trigger-test-fetch-btn"
                  data-testid="trigger-test-fetch-btn"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                  {isSending ? 'Executing Fetch...' : 'Dispatch Fetch'}
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 flex items-start gap-1.5 leading-relaxed bg-stone-100/40 dark:bg-stone-950/40 p-2.5 rounded-xl border border-stone-200/50 dark:border-stone-800/40">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Toggle a mock rule under the <em>API Mock Interceptors</em> tab, then click <strong>Dispatch Fetch</strong> to observe status code overrides.
                </span>
              </div>
            </div>

            {/* Traffic Logs Table / Detail Split (Spans 2 columns) */}
            <div className="lg:col-span-2 flex flex-col justify-between border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden min-h-[300px]">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-stone-400 flex-1">
                  <Activity className="w-8 h-8 opacity-35 mb-2 animate-pulse" />
                  <p className="text-xs font-semibold">No active requests logged</p>
                  <p className="text-[10px] mt-0.5">Outbound fetches made inside the playground will appear here in real-time.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-stone-100 dark:divide-stone-800">
                  {/* Left sub-col: List of logged requests */}
                  <div className="flex-1 max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left border-collapse" id="net-logs-table">
                      <thead>
                        <tr className="bg-stone-50/40 dark:bg-stone-950/40 border-b border-stone-100 dark:border-stone-800 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Method & Path</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-mono text-xs">
                        {logs.map((log) => (
                          <tr 
                             key={log.id} 
                            onClick={() => setSelectedLogId(log.id)}
                            className={`hover:bg-stone-50/50 dark:hover:bg-stone-950/25 transition-colors cursor-pointer ${
                              selectedLogId === log.id ? 'bg-amber-500/10 dark:bg-amber-500/10' : ''
                            }`}
                          >
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] px-1.5 py-0.5 font-bold rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                  {log.method}
                                </span>
                                <span className="text-stone-700 dark:text-stone-300 truncate max-w-[150px] font-semibold" title={log.url}>
                                  {log.url.replace(window.location.origin, '')}
                                </span>
                                {log.mocked && (
                                  <span className="text-[8px] bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 px-1 rounded-sm border border-amber-200/40 font-bold">MOCK</span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(log.status)}`}>
                                {log.statusText}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right text-stone-400 text-[10px] flex flex-col justify-center">
                              <span>{log.timestamp}</span>
                              <span className="text-[9px] font-bold text-stone-500">{log.duration}ms</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Right sub-col: Detailed Inspector Panel */}
                  <div className="w-full lg:w-72 bg-stone-50/30 dark:bg-stone-950/20 p-4 max-h-[300px] overflow-y-auto">
                    {selectedLogId && logs.find(l => l.id === selectedLogId) ? (() => {
                      const log = logs.find(l => l.id === selectedLogId)!;
                      return (
                        <div className="space-y-4 text-xs animate-fade-in" id="net-log-inspector-panel">
                          <div className="border-b border-stone-100 dark:border-stone-800 pb-2">
                            <h5 className="font-bold text-stone-800 dark:text-stone-200 uppercase text-[10px] tracking-wider text-stone-400">Request Details</h5>
                            <p className="text-[10px] font-mono break-all text-amber-600 dark:text-amber-400 mt-1 font-bold">{log.url}</p>
                          </div>

                          <div className="space-y-2 font-mono text-[11px]">
                            <div>
                              <strong className="text-stone-400 dark:text-stone-500 text-[10px]">TIMESTAMP:</strong>
                              <p className="text-stone-700 dark:text-stone-300 mt-0.5">{log.timestamp}</p>
                            </div>
                            <div>
                              <strong className="text-stone-400 dark:text-stone-500 text-[10px]">LATENCY:</strong>
                              <p className="text-stone-700 dark:text-stone-300 mt-0.5">{log.duration} ms</p>
                            </div>
                            {log.requestBody && (
                              <div>
                                <strong className="text-stone-400 dark:text-stone-500 text-[10px]">PAYLOAD SENT:</strong>
                                <pre className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-2 rounded-lg text-[10px] mt-1 overflow-x-auto text-stone-600 dark:text-stone-400 max-h-[80px]">
                                  {log.requestBody}
                                </pre>
                              </div>
                            )}
                            <div>
                              <strong className="text-stone-400 dark:text-stone-500 text-[10px]">RESPONSE payload:</strong>
                              <pre className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-2 rounded-lg text-[10px] mt-1 overflow-x-auto text-stone-600 dark:text-stone-400 max-h-[100px]">
                                {log.responseBody || '{ "empty": true }'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 py-12">
                        <Code className="w-5 h-5 opacity-40 mb-1" />
                        <p className="text-[10px] font-semibold">Select a row log to inspect payload body headers</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Mock Rules Panel */}
        {activeSubTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="panel-net-rules">
            
            {/* Rule Configurator Form (Left col) */}
            <div className="bg-stone-50 dark:bg-stone-950 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 flex flex-col justify-between">
              <form onSubmit={handleAddRule} className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-1">
                    <Plus className="w-3.5 h-3.5 text-amber-500" />
                    Configure New Interceptor Rule
                  </h4>
                  <p className="text-[10px] text-stone-400">Specify an intercept trigger to bypass the server and mock responses.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="rule-pattern" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">URL Match Substring</label>
                    <input
                      type="text"
                      id="rule-pattern"
                      data-testid="rule-pattern"
                      value={newPattern}
                      onChange={(e) => setNewPattern(e.target.value)}
                      placeholder="e.g. /api/v1/auth/session"
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="rule-status" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">HTTP Status</label>
                      <input
                        type="number"
                        id="rule-status"
                        data-testid="rule-status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(Number(e.target.value))}
                        placeholder="200"
                        className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100"
                        required
                        min={100}
                        max={599}
                      />
                    </div>

                    <div>
                      <label htmlFor="rule-delay" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Delay (ms)</label>
                      <input
                        type="number"
                        id="rule-delay"
                        data-testid="rule-delay"
                        value={newDelay}
                        onChange={(e) => setNewDelay(Number(e.target.value))}
                        placeholder="200"
                        className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100"
                        min={0}
                        max={10000}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rule-body" className="block text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1">Response JSON Payload</label>
                    <textarea
                      id="rule-body"
                      data-testid="rule-body"
                      value={newBody}
                      onChange={(e) => setNewBody(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 font-mono focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                {ruleError && (
                  <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {ruleError}
                  </p>
                )}

                <button
                  type="submit"
                  id="add-rule-btn"
                  data-testid="add-rule-btn"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Inject Custom Rule
                </button>
              </form>
            </div>

            {/* Registered Interceptors List (Spans 2 columns) */}
            <div className="lg:col-span-2 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              {rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-stone-400 flex-1 min-h-[220px]">
                  <Settings className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-semibold">No custom interception rules found</p>
                  <p className="text-[10px] mt-0.5">Define mock endpoints to instantly hijack routing payloads.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left border-collapse" id="net-rules-table">
                      <thead>
                        <tr className="bg-stone-50/50 dark:bg-stone-950/40 border-b border-stone-100 dark:border-stone-800/80 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Pattern & Overrides</th>
                          <th className="py-3 px-4">Status & Delay</th>
                          <th className="py-3 px-4 text-center">Interception Toggle</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-mono text-xs">
                        {rules.map((rule) => (
                          <tr key={rule.id} className="hover:bg-stone-50/30 dark:hover:bg-stone-950/20 transition-colors">
                            <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400 max-w-[150px] truncate" title={rule.urlPattern}>
                              {rule.urlPattern}
                            </td>
                            <td className="py-3 px-4 text-stone-500 dark:text-stone-400">
                              <span className="font-bold text-stone-700 dark:text-stone-300">{rule.status}</span>
                              <span className="text-[10px] text-stone-400 block mt-0.5">Delay: {rule.delayMs}ms</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleRule(rule.id)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer ${
                                  rule.enabled
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
                                    : 'bg-stone-50 border-stone-200 text-stone-400 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-500'
                                }`}
                              >
                                {rule.enabled ? 'ACTIVE INTERCEPT' : 'DISABLED'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-1.5 text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-lg transition-all cursor-pointer inline-flex items-center"
                                title={`Delete interceptor ${rule.urlPattern}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
