import { NetworkLog, MockRule } from '../types';

type NetworkListener = (logs: NetworkLog[]) => void;
type RulesListener = (rules: MockRule[]) => void;

class NetworkInterceptorManager {
  private originalFetch: typeof window.fetch | null = null;
  private logs: NetworkLog[] = [];
  private rules: MockRule[] = [
    {
      id: 'rule-1',
      urlPattern: '/api/v1/auth/session',
      status: 200,
      responseBody: JSON.stringify({ status: 'authenticated', user: 'admin_intercepted', role: 'root' }),
      enabled: false,
      delayMs: 500
    },
    {
      id: 'rule-2',
      urlPattern: '/api/v1/checkout',
      status: 402,
      responseBody: JSON.stringify({ error: 'Payment Required', code: 'insufficient_funds' }),
      enabled: false,
      delayMs: 300
    },
    {
      id: 'rule-3',
      urlPattern: '/api/v1/rate-limit',
      status: 429,
      responseBody: JSON.stringify({ error: 'Too Many Requests', retryAfter: 60 }),
      enabled: false,
      delayMs: 200
    }
  ];
  private logListeners: Set<NetworkListener> = new Set();
  private ruleListeners: Set<RulesListener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Load initial rules from localStorage if available
    try {
      const savedRules = localStorage.getItem('network_mock_rules');
      if (savedRules) {
        this.rules = JSON.parse(savedRules);
      }
    } catch (e) {
      console.error('Failed to load mock rules from localStorage', e);
    }

    // Intercept fetch
    if (!this.originalFetch && window.fetch) {
      this.originalFetch = window.fetch.bind(window);
      
      const self = this;
      const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
        const method = init?.method || 'GET';
        const timestamp = new Date().toLocaleTimeString();
        const startTime = Date.now();
        const logId = Math.random().toString(36).substring(2, 9);

        let requestBody = '';
        if (init?.body) {
          if (typeof init.body === 'string') {
            requestBody = init.body;
          } else {
            requestBody = '[Binary/Form Data]';
          }
        }

        // Add initial pending log
        const initialLog: NetworkLog = {
          id: logId,
          timestamp,
          method,
          url: urlStr,
          status: undefined,
          statusText: 'PENDING',
          requestBody,
          responseBody: '',
          duration: 0,
          mocked: false
        };
        self.addLog(initialLog);

        // Check if there is an enabled mock rule matching the URL
        const matchedRule = self.rules.find(rule => rule.enabled && urlStr.includes(rule.urlPattern));

        if (matchedRule) {
          // Delay to simulate network latency
          if (matchedRule.delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, matchedRule.delayMs));
          }

          const duration = Date.now() - startTime;
          const mockResponse = new Response(matchedRule.responseBody, {
            status: matchedRule.status,
            statusText: matchedRule.status === 200 ? 'OK' : 'Mocked Response',
            headers: { 'Content-Type': 'application/json' }
          });

          // Update log
          self.updateLog(logId, {
            status: matchedRule.status,
            statusText: `${matchedRule.status} (Mocked)`,
            responseBody: matchedRule.responseBody,
            duration,
            mocked: true
          });

          return mockResponse;
        }

        // Otherwise fallback to original fetch
        try {
          const response = await self.originalFetch!(input, init);
          const duration = Date.now() - startTime;

          // Attempt to clone response and read body text safely
          let responseBody = '';
          try {
            const clone = response.clone();
            responseBody = await clone.text();
            // Trucate if too long
            if (responseBody.length > 500) {
              responseBody = responseBody.substring(0, 500) + '... [truncated]';
            }
          } catch {
            responseBody = '[Unreadable Response]';
          }

          self.updateLog(logId, {
            status: response.status,
            statusText: response.statusText || `${response.status}`,
            responseBody,
            duration,
            mocked: false
          });

          return response;
        } catch (error: any) {
          const duration = Date.now() - startTime;
          self.updateLog(logId, {
            status: 0,
            statusText: error.message || 'FAILED',
            responseBody: error.stack || 'Network connection failed',
            duration,
            mocked: false
          });
          throw error;
        }
      };

      try {
        Object.defineProperty(window, 'fetch', {
          value: customFetch,
          configurable: true,
          writable: true,
          enumerable: true
        });
      } catch (err) {
        console.warn('Object.defineProperty failed to override window.fetch, falling back to direct assignment.', err);
        try {
          (window as any).fetch = customFetch;
        } catch (fallbackErr) {
          console.error('All fetch interception methods failed due to sandbox constraints.', fallbackErr);
        }
      }
    }
  }

  // Logs management
  public getLogs(): NetworkLog[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.notifyLogListeners();
  }

  private addLog(log: NetworkLog) {
    this.logs = [log, ...this.logs].slice(0, 50); // Keep last 50 logs
    this.notifyLogListeners();
  }

  private updateLog(id: string, updates: Partial<NetworkLog>) {
    this.logs = this.logs.map(log => log.id === id ? { ...log, ...updates } : log);
    this.notifyLogListeners();
  }

  public subscribeLogs(listener: NetworkListener) {
    this.logListeners.add(listener);
    listener([...this.logs]);
    return () => {
      this.logListeners.delete(listener);
    };
  }

  private notifyLogListeners() {
    this.logListeners.forEach(listener => listener([...this.logs]));
  }

  // Rules management
  public getRules(): MockRule[] {
    return [...this.rules];
  }

  public saveRules(newRules: MockRule[]) {
    this.rules = newRules;
    try {
      localStorage.setItem('network_mock_rules', JSON.stringify(newRules));
    } catch (e) {
      console.error(e);
    }
    this.notifyRuleListeners();
  }

  public toggleRule(id: string) {
    const updated = this.rules.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule);
    this.saveRules(updated);
  }

  public addRule(rule: MockRule) {
    const updated = [...this.rules, rule];
    this.saveRules(updated);
  }

  public deleteRule(id: string) {
    const updated = this.rules.filter(rule => rule.id !== id);
    this.saveRules(updated);
  }

  public subscribeRules(listener: RulesListener) {
    this.ruleListeners.add(listener);
    listener([...this.rules]);
    return () => {
      this.ruleListeners.delete(listener);
    };
  }

  private notifyRuleListeners() {
    this.ruleListeners.forEach(listener => listener([...this.rules]));
  }
}

export const networkInterceptor = new NetworkInterceptorManager();
