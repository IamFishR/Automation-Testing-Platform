import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  User,
  MapPin,
  Coins,
  TrendingUp,
  BarChart3,
  Settings,
  Trash2,
  RefreshCw,
  Plus,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Info,
  DollarSign,
  Briefcase,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Shared types inside this flows module
interface OrderRecord {
  id: string;
  timestamp: string;
  email: string;
  companyName: string;
  plan: 'Basic' | 'Professional' | 'Enterprise';
  amount: number;
  paymentStatus: 'Settled' | 'Refunded' | 'Failed';
  country: string;
  cardNumber: string;
}

export default function IntegratedFlows() {
  // --- Flow Stage Control ---
  // Stages: 'login' | 'otp' | 'profile' | 'payment' | 'success_dashboard'
  const [currentStage, setCurrentStage] = useState<'login' | 'otp' | 'profile' | 'payment' | 'success_dashboard'>('login');
  
  // Simulated State Database
  const [orders, setOrders] = useState<OrderRecord[]>([
    { id: 'TX-8391', timestamp: '2026-07-14 10:14', email: 'alpha.tester@acme.corp', companyName: 'Acme Corp', plan: 'Enterprise', amount: 1499.00, paymentStatus: 'Settled', country: 'United States', cardNumber: '•••• 4242' },
    { id: 'TX-7214', timestamp: '2026-07-14 11:22', email: 'dev.ops@stack.io', companyName: 'StackIO Inc', plan: 'Professional', amount: 499.00, paymentStatus: 'Settled', country: 'United Kingdom', cardNumber: '•••• 5521' },
    { id: 'TX-6012', timestamp: '2026-07-14 13:05', email: 'billing@clouder.de', companyName: 'Clouder GmbH', plan: 'Basic', amount: 99.00, paymentStatus: 'Failed', country: 'Germany', cardNumber: '•••• 9982' },
  ]);

  // Global Simulator Settings
  const [latencyMultiplier, setLatencyMultiplier] = useState<number>(1); // For mocking network delays
  const [forcedFailure, setForcedFailure] = useState<boolean>(false);

  // --- STAGE 1: LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // --- STAGE 2: OTP STATE ---
  const [otpSentCode, setOtpSentCode] = useState('482195'); // Predefined but can be randomized
  const [otpInput, setOtpInput] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft] = useState(120); // 2 minutes countdown
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // --- STAGE 3: PROFILE FORM STATE ---
  const [companyName, setCompanyName] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'Basic' | 'Professional' | 'Enterprise'>('Professional');
  const [region, setRegion] = useState('US-East');
  const [complianceAgreement, setComplianceAgreement] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  // Nested Collapsible Configuration (Advanced Config)
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [customPort, setCustomPort] = useState('443');
  const [enableWebhook, setEnableWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.acme.corp/webhook');
  const [dataRetentionDays, setDataRetentionDays] = useState('90');

  // --- STAGE 4: PAYMENT GATEWAY STATE ---
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccessCode, setPaymentSuccessCode] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedErrorMode, setSelectedErrorMode] = useState<'none' | 'insufficient_funds' | 'card_declined' | 'timeout'>('none');

  // Trigger countdown when entering OTP stage
  useEffect(() => {
    let timer: any;
    if (currentStage === 'otp' && otpTimeLeft > 0) {
      timer = setInterval(() => {
        setOtpTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStage, otpTimeLeft]);

  // Auto focus first OTP input when arriving on OTP page
  useEffect(() => {
    if (currentStage === 'otp') {
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 100);
    }
  }, [currentStage]);

  // Format Card Number (4-4-4-4)
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length > 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  // Format CVC (3 digits)
  const handleCvcChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 3);
    setCardCvc(clean);
  };

  // --- STEP ACTIONS & TRIGGERS ---

  // LOGIN PROCESS
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.includes('@') || loginEmail.length < 5) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    setIsAuthenticating(true);
    // Simulate API network call based on latencyMultiplier
    setTimeout(() => {
      setIsAuthenticating(false);
      // Generate randomized 6-digit OTP
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpSentCode(randomOtp);
      setOtpInput(['', '', '', '', '', '']);
      setOtpTimeLeft(120);
      setCorporateEmail(loginEmail); // Pass initial email
      setCurrentStage('otp');
    }, 800 * latencyMultiplier);
  };

  // OTP SUBMIT
  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpInput];
    newOtp[index] = cleanVal;
    setOtpInput(newOtp);
    setOtpError('');

    // If input is typed, move to next
    if (cleanVal && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      const newOtp = [...otpInput];
      newOtp[index - 1] = '';
      setOtpInput(newOtp);
      otpRefs[index - 1].current?.focus();
    }
  };

  const verifyOtpCode = () => {
    const enteredOtp = otpInput.join('');
    if (enteredOtp.length < 6) {
      setOtpError('Please fill in all 6 numbers.');
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      if (enteredOtp === otpSentCode) {
        setOtpError('');
        setCurrentStage('profile');
      } else {
        setOtpError('Invalid OTP code. Verify cellular logger below.');
      }
    }, 600 * latencyMultiplier);
  };

  // PROFILE FORM SUBMIT
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    if (!companyName.trim()) {
      setProfileError('Company Name is required.');
      return;
    }
    if (!corporateEmail.includes('@')) {
      setProfileError('Valid corporate email is required.');
      return;
    }
    if (!complianceAgreement) {
      setProfileError('You must agree to the Regulatory & SLA Terms.');
      return;
    }

    setCurrentStage('payment');
  };

  // PAYMENT GATEWAY SUBMIT
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setIsProcessingPayment(true);

    if (!cardHolder.trim()) {
      setPaymentError('Cardholder Name is required.');
      setIsProcessingPayment(false);
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setPaymentError('Credit card number must be 16 digits.');
      setIsProcessingPayment(false);
      return;
    }
    if (cardExpiry.length < 5) {
      setPaymentError('Provide valid expiration (MM/YY).');
      setIsProcessingPayment(false);
      return;
    }
    if (cardCvc.length < 3) {
      setPaymentError('Provide 3-digit CVV card security code.');
      setIsProcessingPayment(false);
      return;
    }

    const priceMap = { Basic: 99.00, Professional: 499.00, Enterprise: 1499.00 };
    const amount = priceMap[selectedPlan];

    setTimeout(() => {
      setIsProcessingPayment(false);

      if (forcedFailure) {
        setPaymentError('SIMULATOR ERROR: Hard failure signal active.');
        return;
      }

      if (selectedErrorMode === 'insufficient_funds') {
        setPaymentError('Gateway Declined: 51 - Insufficient Funds.');
        return;
      } else if (selectedErrorMode === 'card_declined') {
        setPaymentError('Gateway Declined: 05 - Do Not Honor (Card Blocked).');
        return;
      } else if (selectedErrorMode === 'timeout') {
        setPaymentError('Gateway Error: 408 - Connection Timeout (Mock Failure).');
        return;
      }

      // Success Path! Create dynamic transaction
      const generatedTxId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: OrderRecord = {
        id: generatedTxId,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        email: corporateEmail,
        companyName,
        plan: selectedPlan,
        amount,
        paymentStatus: 'Settled',
        country: region === 'US-East' || region === 'US-West' ? 'United States' : region === 'EU-Central' ? 'Germany' : 'Singapore',
        cardNumber: `•••• ${cardNumber.slice(-4)}`
      };

      setOrders(prev => [newOrder, ...prev]);
      setPaymentSuccessCode(generatedTxId);
      setCurrentStage('success_dashboard');
    }, 1500 * latencyMultiplier);
  };

  const getPlanDetails = () => {
    switch (selectedPlan) {
      case 'Basic':
        return { price: '$99/mo', desc: 'SLA up to 99.5%, standard container pipeline nodes, 10 team seats.' };
      case 'Professional':
        return { price: '$499/mo', desc: 'SLA up to 99.9%, high availability cluster, 100 team seats, 1hr support.' };
      case 'Enterprise':
        return { price: '$1,499/mo', desc: 'SLA up to 99.99%, dedicated Bare Metal Node servers, custom private subnets.' };
    }
  };

  // Calculation metrics for dynamic reports
  const totalVolume = orders
    .filter(o => o.paymentStatus === 'Settled')
    .reduce((sum, o) => sum + o.amount, 0);

  const planBreakdown = orders.reduce((acc, o) => {
    acc[o.plan] = (acc[o.plan] || 0) + 1;
    return acc;
  }, { Basic: 0, Professional: 0, Enterprise: 0 } as Record<string, number>);

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const resetFlow = () => {
    setLoginEmail('');
    setLoginPassword('');
    setOtpInput(['', '', '', '', '', '']);
    setCompanyName('');
    setCorporateEmail('');
    setSelectedPlan('Professional');
    setRegion('US-East');
    setComplianceAgreement(false);
    setCardHolder('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setPaymentError('');
    setPaymentSuccessCode('');
    setCurrentStage('login');
  };

  return (
    <div className="space-y-8" id="integrated-flows-container">
      {/* Overview Block */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-stone-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Integrated Transaction Portal & Analytics Pipeline
            </h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 max-w-3xl leading-relaxed">
              This interactive flow chains multiple key authentication, customer profiles, secure payment gates, reporting tools, and back-office order databases together. Excellent for conducting full end-to-end automation test scenarios.
            </p>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-950 px-4 py-2.5 rounded-xl border border-stone-100 dark:border-stone-900 text-xs text-stone-500 font-mono">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              Volume: <strong className="text-stone-800 dark:text-stone-200">${totalVolume.toLocaleString()}</strong>
            </span>
            <span className="text-stone-300 dark:text-stone-800">|</span>
            <span>
              Records: <strong className="text-stone-800 dark:text-stone-200">{orders.length}</strong>
            </span>
          </div>
        </div>

        {/* Global Debugger & Test Simulator Toolbench */}
        <div className="mt-4 pt-4 border-t border-stone-50 dark:border-stone-800 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Settings className="w-3.5 h-3.5 text-stone-400 animate-spin" /> E2E Simulator Bench:
          </span>
          
          {/* Latency dial */}
          <div className="flex items-center gap-2">
            <label htmlFor="sim-latency-select" className="text-stone-500 text-[11px] font-medium">Latency Delay:</label>
            <select
              id="sim-latency-select"
              data-testid="sim-latency-select"
              value={latencyMultiplier}
              onChange={(e) => setLatencyMultiplier(Number(e.target.value))}
              className="bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded px-2 py-0.5 text-[11px] text-stone-700 dark:text-stone-300 cursor-pointer focus:outline-none"
            >
              <option value="0">0ms (Instantaneous)</option>
              <option value="1">800ms (Standard Network)</option>
              <option value="2.5">2000ms (High Congestion)</option>
            </select>
          </div>

          {/* Payment failure mock */}
          <div className="flex items-center gap-2">
            <label htmlFor="sim-failure-select" className="text-stone-500 text-[11px] font-medium">Payment Error Mode:</label>
            <select
              id="sim-failure-select"
              data-testid="sim-failure-select"
              value={selectedErrorMode}
              onChange={(e) => setSelectedErrorMode(e.target.value as any)}
              className="bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded px-2 py-0.5 text-[11px] text-stone-700 dark:text-stone-300 cursor-pointer focus:outline-none"
            >
              <option value="none">None (Succeed Card)</option>
              <option value="insufficient_funds">Insufficient Funds (51)</option>
              <option value="card_declined">Card Blocked (05)</option>
              <option value="timeout">Gateway Timeout (408)</option>
            </select>
          </div>

          {/* Hard Error toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sim-force-failure"
              data-testid="sim-force-failure"
              checked={forcedFailure}
              onChange={(e) => setForcedFailure(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="sim-force-failure" className="text-red-500 dark:text-red-400 text-[11px] font-semibold cursor-pointer select-none">
              Force Fatal API Failure
            </label>
          </div>
        </div>
      </div>

      {/* Primary Card View Container with Stage Animation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Step List Tracker Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5 shadow-xs h-fit space-y-4">
          <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest font-mono">
            Flow Pipeline Stages
          </h3>
          <div className="space-y-1">
            {[
              { key: 'login', label: '1. User Account Login', desc: 'Secure security key entry' },
              { key: 'otp', label: '2. Cellular OTP Check', desc: 'Multi-factor authentication' },
              { key: 'profile', label: '3. Organization Config', desc: 'Cluster & SLA parameters' },
              { key: 'payment', label: '4. Enterprise Payment', desc: 'Credit card transaction gateway' },
              { key: 'success_dashboard', label: '5. Success & Dashboard', desc: 'Analytics reporting & logs' }
            ].map((stg) => {
              const stagesList = ['login', 'otp', 'profile', 'payment', 'success_dashboard'];
              const currentIdx = stagesList.indexOf(currentStage);
              const thisIdx = stagesList.indexOf(stg.key);
              
              const isCompleted = thisIdx < currentIdx;
              const isActive = stg.key === currentStage;

              return (
                <div
                  key={stg.key}
                  className={`p-3 rounded-xl transition-all border text-left ${
                    isActive
                      ? 'bg-stone-50/60 dark:bg-stone-950/20 border-stone-200 dark:border-amber-900/60'
                      : isCompleted
                      ? 'bg-emerald-50/10 dark:bg-emerald-950/5 border-emerald-100/30 dark:border-emerald-900/10'
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 ${
                      isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : isActive 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : thisIdx + 1}
                    </div>
                    <div>
                      <h4 className={`text-xs font-semibold ${isActive ? 'text-amber-700 dark:text-indigo-400' : isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500'}`}>
                        {stg.label}
                      </h4>
                      <p className="text-[10px] text-stone-400 mt-0.5 leading-none">{stg.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {currentStage !== 'login' && (
            <button
              onClick={resetFlow}
              id="reset-flow-early-btn"
              data-testid="reset-flow-early-btn"
              className="w-full mt-2 py-1.5 px-3 border border-dashed border-red-200 dark:border-red-900/40 text-[11px] font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Flow Early
            </button>
          )}
        </div>

        {/* Dynamic Forms Workspace Area */}
        <div className="lg:col-span-3 flex flex-col min-h-[460px] relative">
          
          <AnimatePresence mode="wait">
            
            {/* STAGE 1: ACCOUNT LOGIN */}
            {currentStage === 'login' && (
              <motion.div
                key="stage-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 md:p-8 flex flex-col justify-between flex-1 shadow-xs"
                id="portal-auth-container"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 font-display">
                      <Lock className="w-4.5 h-4.5 text-amber-500" />
                      Sign In to Transaction Hub
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Enter administrative credentials. Credentials are processed locally without real server validation.
                    </p>
                  </div>

                  {loginError && (
                    <div id="login-error-banner" data-testid="login-error" className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} id="login-form-element" className="space-y-4">
                    <div>
                      <label htmlFor="login-email-input" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Admin Email Address
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-stone-400" />
                        <input
                          type="email"
                          id="login-email-input"
                          data-testid="login-email-input"
                          placeholder="admin@enterprise.corp"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="login-password-input" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Security Access Password
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 w-4.5 h-4.5 text-stone-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="login-password-input"
                          data-testid="login-password-input"
                          placeholder="••••••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                        <button
                          type="button"
                          id="toggle-login-pass-btn"
                          data-testid="toggle-login-pass"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2 w-5 h-5 flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="login-submit-btn"
                      data-testid="login-submit"
                      disabled={isAuthenticating}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isAuthenticating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isAuthenticating ? 'Authorizing Key...' : 'Request Access PIN'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-50 dark:border-stone-800/80 text-[11px] text-stone-400 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span><strong>E2E Tester Prompt:</strong> Use any dummy email and password. Any password of 6+ characters will be accepted.</span>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: CELLULAR OTP PIN CHALLENGE */}
            {currentStage === 'otp' && (
              <motion.div
                key="stage-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 md:p-8 flex flex-col justify-between flex-1 shadow-xs"
                id="portal-otp-container"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 font-display">
                      <KeyRound className="w-4.5 h-4.5 text-amber-500" />
                      Multi-Factor Token Challenge
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      A unique cellular authentication pin was dispatched to the system operator. Input the 6-digit passcode.
                    </p>
                  </div>

                  {otpError && (
                    <div id="otp-error-banner" data-testid="otp-error" className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Pin Input Group */}
                    <div className="flex justify-center items-center gap-2">
                      {otpInput.map((val, idx) => (
                        <input
                          key={idx}
                          ref={otpRefs[idx]}
                          id={`otp-pin-field-${idx}`}
                          data-testid={`otp-pin-${idx}`}
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={val}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white transition-all"
                        />
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs text-stone-500">
                      <span>Pin expires in: <strong className="font-mono text-amber-600 dark:text-amber-400">{Math.floor(otpTimeLeft / 60)}:{(otpTimeLeft % 60).toString().padStart(2, '0')}</strong></span>
                      <button
                        type="button"
                        id="otp-resend-btn"
                        data-testid="otp-resend"
                        onClick={() => {
                          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                          setOtpSentCode(newCode);
                          setOtpTimeLeft(120);
                        }}
                        className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    </div>

                    <button
                      type="button"
                      id="otp-verify-submit-btn"
                      data-testid="otp-verify-submit"
                      onClick={verifyOtpCode}
                      disabled={isVerifyingOtp}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingOtp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isVerifyingOtp ? 'Decrypting Security Token...' : 'Verify Passcode'}</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Cellular Terminal Logger (Essential for scrapers to look up generated PINs dynamically!) */}
                <div className="mt-6 p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-amber-500 font-mono flex items-center gap-1.5 uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    Simulated Operator Mobile Device Log
                  </span>
                  <div className="font-mono text-[11px] text-stone-400 leading-normal" id="mock-operator-cellular-terminal" data-testid="mock-cellular-terminal">
                    &gt; Carrier Incoming SMS Message: <br />
                    <span className="text-white font-bold bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 rounded text-xs select-all" id="cellular-otp-code-container" data-testid="cellular-otp-code">
                      {otpSentCode}
                    </span> is your QA Sandbox authentication pass key. Valid for 2 minutes.
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: COMPANY DETAILS & CONFIGURATION */}
            {currentStage === 'profile' && (
              <motion.div
                key="stage-profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 md:p-8 flex flex-col justify-between flex-1 shadow-xs"
                id="portal-profile-container"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 font-display">
                      <Building className="w-4.5 h-4.5 text-amber-500" />
                      Configure Corporate Instance Details
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Set up metadata. Checkbox selectors and collapsible options trigger nested components.
                    </p>
                  </div>

                  {profileError && (
                    <div id="profile-error-banner" data-testid="profile-error" className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} id="profile-config-form" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="profile-company-input" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                          Organization / Company Name
                        </label>
                        <input
                          type="text"
                          id="profile-company-input"
                          data-testid="profile-company-input"
                          placeholder="Acme Enterprise Solutions"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="profile-region-select" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                          Deployment Region
                        </label>
                        <select
                          id="profile-region-select"
                          data-testid="profile-region-select"
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                        >
                          <option value="US-East">US East (N. Virginia)</option>
                          <option value="US-West">US West (Oregon)</option>
                          <option value="EU-Central">Europe (Frankfurt)</option>
                          <option value="AP-Southeast">Asia Pacific (Singapore)</option>
                        </select>
                      </div>
                    </div>

                    {/* Subscription tier cards */}
                    <div>
                      <span className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">Select Cluster Tier</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {([
                          { key: 'Basic', title: 'Basic Node', price: '$99/mo' },
                          { key: 'Professional', title: 'Professional Core', price: '$499/mo' },
                          { key: 'Enterprise', title: 'Bare Metal Grid', price: '$1,499/mo' }
                        ] as const).map((plan) => (
                          <div
                            key={plan.key}
                            id={`plan-card-${plan.key.toLowerCase()}`}
                            data-testid={`plan-card-${plan.key.toLowerCase()}`}
                            onClick={() => setSelectedPlan(plan.key)}
                            className={`p-3 rounded-xl border cursor-pointer text-left transition-all relative ${
                              selectedPlan === plan.key
                                ? 'bg-stone-50/50 dark:bg-stone-950/20 border-amber-500 ring-1 ring-amber-500'
                                : 'bg-stone-50/30 dark:bg-stone-950/40 border-stone-100 dark:border-stone-800 hover:border-stone-200'
                            }`}
                          >
                            <span className="block text-xs font-bold text-stone-800 dark:text-white leading-none">{plan.title}</span>
                            <span className="block text-[11px] text-amber-600 dark:text-indigo-400 font-bold mt-1.5">{plan.price}</span>
                            {selectedPlan === plan.key && (
                              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-2 leading-relaxed bg-stone-50 dark:bg-stone-950 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
                        {getPlanDetails()?.desc}
                      </p>
                    </div>

                    {/* COLLAPSIBLE ADVANCED SETTINGS SECTOR (Shows hidden elements) */}
                    <div className="border border-stone-100 dark:border-stone-800 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        id="toggle-advanced-config-btn"
                        data-testid="toggle-advanced-config"
                        onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                        className="w-full flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-900/60 transition-colors cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300"
                      >
                        <span className="flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-amber-500" />
                          Advanced Environment Webhooks (Optional)
                        </span>
                        {showAdvancedConfig ? <ChevronDown className="w-4 h-4 text-stone-500" /> : <ChevronRight className="w-4 h-4 text-stone-500" />}
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {showAdvancedConfig && (
                          <motion.div
                            key="advanced-config"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden border-t border-stone-100 dark:border-stone-800"
                          >
                            <div className="p-3 bg-white dark:bg-stone-900 space-y-3" id="advanced-config-content">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label htmlFor="config-custom-port" className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                                    Port Address Bound
                                  </label>
                                  <input
                                    type="text"
                                    id="config-custom-port"
                                    data-testid="config-custom-port"
                                    value={customPort}
                                    onChange={(e) => setCustomPort(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="config-retention-select" className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                                    Cloud Logs Retention
                                  </label>
                                  <select
                                    id="config-retention-select"
                                    data-testid="config-retention-select"
                                    value={dataRetentionDays}
                                    onChange={(e) => setDataRetentionDays(e.target.value)}
                                    className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
                                  >
                                    <option value="30">30 Days Storage</option>
                                    <option value="90">90 Days Storage</option>
                                    <option value="365">1 Year Audit Backup</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="config-webhook-enable"
                                  data-testid="config-webhook-enable"
                                  checked={enableWebhook}
                                  onChange={(e) => setEnableWebhook(e.target.checked)}
                                  className="h-3.5 w-3.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                />
                                <label htmlFor="config-webhook-enable" className="text-[11px] font-medium text-stone-600 dark:text-stone-400 cursor-pointer select-none">
                                  Dispatch event logs via dynamic webhooks
                                </label>
                              </div>

                              {enableWebhook && (
                                <div className="animate-fade-in">
                                  <label htmlFor="config-webhook-url" className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                                    Webhook Endpoint Destination
                                  </label>
                                  <input
                                    type="url"
                                    id="config-webhook-url"
                                    data-testid="config-webhook-url"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="profile-agreement-checkbox"
                        data-testid="profile-agreement"
                        checked={complianceAgreement}
                        onChange={(e) => setComplianceAgreement(e.target.checked)}
                        className="h-4 w-4 mt-0.5 rounded border-stone-300 dark:border-stone-800 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <label htmlFor="profile-agreement-checkbox" className="ml-2 block text-[11px] text-stone-500 dark:text-stone-400 select-none cursor-pointer">
                        I authorize provision of services & declare adherence to sovereign security SLAs.
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2">
                      <button
                        type="button"
                        id="profile-back-btn"
                        data-testid="profile-back"
                        onClick={() => setCurrentStage('otp')}
                        className="px-4 py-2 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-950/40 transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        id="profile-submit-btn"
                        data-testid="profile-submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        Proceed to Payment <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* STAGE 4: ENTERPRISE PAYMENT GATEWAY */}
            {currentStage === 'payment' && (
              <motion.div
                key="stage-payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 md:p-8 flex flex-col justify-between flex-1 shadow-xs"
                id="portal-payment-container"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 font-display">
                        <CreditCard className="w-4.5 h-4.5 text-amber-500" />
                        Secure Payment Node
                      </h3>
                      <p className="text-xs text-stone-400 mt-1">
                        Finalize SLA cluster activation. Credit card triggers a local mock payment processor.
                      </p>
                    </div>
                    {/* Invoice block */}
                    <div className="bg-stone-50/50 dark:bg-stone-950/20 px-3 py-1.5 rounded-xl border border-stone-100/50 dark:border-amber-900/30 text-right">
                      <span className="text-[10px] text-amber-600 dark:text-indigo-400 block font-mono">Invoice Total</span>
                      <span className="text-sm font-bold text-stone-900 dark:text-white font-mono">{getPlanDetails()?.price}</span>
                    </div>
                  </div>

                  {paymentError && (
                    <div id="payment-error-banner" data-testid="payment-error" className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Split visual card and form input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Real-time Visual Card Render */}
                    <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-stone-950 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between h-[160px] relative overflow-hidden" id="card-preview-window">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10 pointer-events-none"></div>
                      
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] uppercase tracking-widest font-semibold font-mono text-stone-200">Sandbox Issuer</span>
                        <Coins className="w-6 h-6 text-stone-300" />
                      </div>

                      <div className="space-y-1">
                        <span className="block font-mono text-base tracking-widest font-semibold select-all" id="card-preview-number" data-testid="card-preview-number">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </span>
                        <div className="flex justify-between text-[10px] font-mono text-stone-200 leading-none">
                          <span className="block truncate uppercase max-w-[120px]" id="card-preview-holder">
                            {cardHolder || 'CARDHOLDER NAME'}
                          </span>
                          <span className="block font-semibold" id="card-preview-expiry">
                            {cardExpiry || 'MM/YY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CC Form Controls */}
                    <form onSubmit={handlePaymentSubmit} id="checkout-payment-form" className="space-y-3">
                      <div>
                        <label htmlFor="payment-card-holder" className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Cardholder Full Name
                        </label>
                        <input
                          type="text"
                          id="payment-card-holder"
                          data-testid="payment-card-holder"
                          placeholder="Elizabeth Windsor"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="payment-card-number" className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Card Account Number
                        </label>
                        <input
                          type="text"
                          id="payment-card-number"
                          data-testid="payment-card-number"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="payment-card-expiry" className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                            Expiration (MM/YY)
                          </label>
                          <input
                            type="text"
                            id="payment-card-expiry"
                            data-testid="payment-card-expiry"
                            placeholder="12/28"
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="payment-card-cvc" className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                            Card CVC Security
                          </label>
                          <input
                            type="password"
                            id="payment-card-cvc"
                            data-testid="payment-card-cvc"
                            placeholder="•••"
                            value={cardCvc}
                            onChange={(e) => handleCvcChange(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-3">
                        <button
                          type="button"
                          id="payment-back-btn"
                          data-testid="payment-back"
                          onClick={() => setCurrentStage('profile')}
                          className="px-4 py-2 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-950/40 transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          id="payment-submit-btn"
                          data-testid="payment-submit"
                          disabled={isProcessingPayment}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isProcessingPayment && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>{isProcessingPayment ? 'Settling Gateway funds...' : `Pay ${getPlanDetails()?.price}`}</span>
                        </button>
                      </div>
                    </form>

                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-50 dark:border-stone-800/80 text-[11px] text-stone-400 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Use test card numbers (e.g. 4242 4242 4242 4242). Modify the bench selects above to trigger instant decline errors.</span>
                </div>
              </motion.div>
            )}

            {/* STAGE 5: CONFIRMATION SUCCESS & ANALYTICS REPORTING/MANAGEMENT DASHBOARD */}
            {currentStage === 'success_dashboard' && (
              <motion.div
                key="stage-dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-1 w-full"
                id="portal-dashboard-container"
              >
                {/* Success alert block */}
                {paymentSuccessCode && (
                  <div id="payment-success-banner" data-testid="payment-success" className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-2xl text-emerald-800 dark:text-emerald-400 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                      <div>
                        <strong className="block text-sm font-bold text-emerald-800 dark:text-emerald-300">Transaction Settled Successfully!</strong>
                        <p className="text-[11px] mt-0.5 text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                          The organization <strong className="font-semibold">{companyName}</strong> has been provisioned on the {selectedPlan} cluster nodes.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl font-mono text-[11px]">
                      Receipt ID: <strong id="receipt-id-tag" data-testid="receipt-id" className="text-emerald-600 dark:text-emerald-400 select-all">{paymentSuccessCode}</strong>
                    </div>
                  </div>
                )}

                {/* KPI Metrics Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 p-4 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Total Processing Volume</span>
                      <h4 className="text-lg font-bold font-mono text-stone-900 dark:text-white mt-1" id="kpi-processing-volume">${totalVolume.toLocaleString()}</h4>
                      <p className="text-[10px] text-emerald-500 flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3" /> +14.2% local simulation</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-stone-50 dark:bg-stone-950/30 text-amber-600 dark:text-indigo-400 flex items-center justify-center">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 p-4 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Cluster Subscriptions</span>
                      <h4 className="text-lg font-bold font-mono text-stone-900 dark:text-white mt-1" id="kpi-subscriptions-count">{orders.length} Active</h4>
                      <p className="text-[10px] text-stone-400 mt-0.5">Basic: {planBreakdown.Basic} | Pro: {planBreakdown.Professional} | Ent: {planBreakdown.Enterprise}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 p-4 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Deployment Status</span>
                      <h4 className="text-lg font-bold text-stone-900 dark:text-white mt-1 flex items-center gap-1.5" id="kpi-deployment-health">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        99.98% Health
                      </h4>
                      <p className="text-[10px] text-stone-400 mt-0.5">Webhooks active | Gateway Live</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Settings className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE REPORTING ANALYTICS PANEL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Reporting Panel A: Volume Distribution (SVG Graph) */}
                  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4 border-b border-stone-50 dark:border-stone-800 pb-3">
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5 font-display">
                        <BarChart3 className="w-4 h-4 text-amber-500" />
                        Interactive Volume Trends
                      </h4>
                      <span className="text-[10px] text-amber-600 dark:text-indigo-400 font-mono">Dynamic Live Feed</span>
                    </div>

                    <div className="relative h-44 w-full flex items-end justify-between px-4 pt-6 pb-2 bg-stone-50/50 dark:bg-stone-950/20 rounded-xl border border-stone-100 dark:border-stone-900/60" id="sales-svg-chart">
                      {/* SVG grid lines */}
                      <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-stone-200 dark:border-stone-800/80 pointer-events-none"></div>
                      <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-stone-200 dark:border-stone-800/80 pointer-events-none"></div>
                      <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-stone-200 dark:border-stone-800/80 pointer-events-none"></div>

                      {/* Displaying orders bar nodes dynamically */}
                      {orders.map((ord, idx) => {
                        const maxAmt = Math.max(...orders.map(o => o.amount), 1500);
                        const percentHeight = Math.max((ord.amount / maxAmt) * 100, 10);
                        const isSettled = ord.paymentStatus === 'Settled';

                        return (
                          <div key={ord.id} className="flex flex-col items-center group relative z-10 flex-1">
                            {/* Value tooltip */}
                            <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-stone-900 text-white text-[9px] font-mono py-1 px-1.5 rounded shadow-lg">
                              ${ord.amount.toLocaleString()}
                            </div>
                            
                            {/* Animated bar height */}
                            <div
                              className={`w-10 rounded-t-md transition-all duration-500 ${
                                isSettled 
                                  ? 'bg-amber-500 dark:bg-indigo-400 group-hover:bg-amber-600' 
                                  : 'bg-red-400 dark:bg-red-500 group-hover:bg-red-600'
                              }`}
                              style={{ height: `${percentHeight * 1.2}px` }}
                            ></div>
                            
                            <span className="text-[9px] font-mono text-stone-400 mt-2">{ord.id}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center gap-4 mt-3 text-[10px] text-stone-400">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded"></span> Settled Nodes</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-400 rounded"></span> Failed / Cancelled</span>
                    </div>
                  </div>

                  {/* Reporting Panel B: Subscriptions Plan Breakdown */}
                  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4 border-b border-stone-50 dark:border-stone-800 pb-3">
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5 font-display">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        SLA Segment Performance
                      </h4>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">Telemetry Ratios</span>
                    </div>

                    <div className="space-y-4 pt-1 flex flex-col justify-center h-44">
                      {([
                        { name: 'Bare Metal Grid (Enterprise)', count: planBreakdown.Enterprise, color: 'bg-amber-500', totalVal: planBreakdown.Enterprise * 1499 },
                        { name: 'Professional Core (Pro)', count: planBreakdown.Professional, color: 'bg-purple-500', totalVal: planBreakdown.Professional * 499 },
                        { name: 'Basic Node (Starter)', count: planBreakdown.Basic, color: 'bg-amber-500', totalVal: planBreakdown.Basic * 99 }
                      ]).map((item) => {
                        const totalOrders = orders.length || 1;
                        const percentage = ((item.count / totalOrders) * 100).toFixed(0);

                        return (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                              <span className="flex items-center gap-1.5 truncate">
                                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                                {item.name}
                              </span>
                              <span className="font-mono text-stone-400">{item.count} items ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-stone-100 dark:bg-stone-950 h-2 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* BACK OFFICE MANAGEMENT & TRANSACTION LOGS */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5 shadow-xs" id="backoffice-management-panel">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-50 dark:border-stone-800 pb-4 mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest flex items-center gap-1.5 font-display">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                        Admin Order Management Console
                      </h4>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Active live state lookup. Delete, alter, or simulate gateway actions. Excellent for checking row removal automation routines.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Inject mock order
                          const mockEmails = ['tester@cypress.io', 'playwright@microsoft.com', 'selenium@webdriver.org'];
                          const mockCompanies = ['Cypress Sandbox', 'Microsoft E2E', 'Selenium HQ'];
                          const mockCountries = ['United States', 'Germany', 'Singapore', 'Canada'];
                          const randIdx = Math.floor(Math.random() * 3);
                          const mockId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
                          
                          const randomOrder: OrderRecord = {
                            id: mockId,
                            timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
                            email: mockEmails[randIdx],
                            companyName: mockCompanies[randIdx],
                            plan: ['Basic', 'Professional', 'Enterprise'][randIdx] as any,
                            amount: [99.00, 499.00, 1499.00][randIdx],
                            paymentStatus: Math.random() > 0.15 ? 'Settled' : 'Failed',
                            country: mockCountries[Math.floor(Math.random() * mockCountries.length)],
                            cardNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`
                          };
                          setOrders(prev => [randomOrder, ...prev]);
                        }}
                        id="dashboard-inject-record-btn"
                        data-testid="dashboard-inject-record"
                        className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Inject Sample Record
                      </button>

                      <button
                        onClick={resetFlow}
                        id="restart-full-flow-btn"
                        data-testid="restart-full-flow"
                        className="py-1.5 px-3 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 font-medium rounded-lg text-[10px] hover:bg-stone-50 dark:hover:bg-stone-950/40 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Restart Auth Flow
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs" id="backoffice-transactions-table">
                      <thead>
                        <tr className="border-b border-stone-100 dark:border-stone-800 text-stone-400 font-medium text-[10px] uppercase">
                          <th className="py-2.5 px-2">Order ID</th>
                          <th className="py-2.5 px-2">Company</th>
                          <th className="py-2.5 px-2">Operator Contact</th>
                          <th className="py-2.5 px-2 text-center">Cluster SLA</th>
                          <th className="py-2.5 px-2 text-right">Invoice Amount</th>
                          <th className="py-2.5 px-2 text-center">Gateway Status</th>
                          <th className="py-2.5 px-2 text-center">Operation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50 dark:divide-stone-800/60 font-medium text-stone-700 dark:text-stone-300">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-stone-400 font-mono text-[11px]" id="empty-db-status">
                              Database table is empty. Inject a sample record to continue.
                            </td>
                          </tr>
                        ) : (
                          orders.map((ord) => (
                            <tr key={ord.id} id={`row-order-${ord.id}`} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40 transition-colors">
                              <td className="py-2.5 px-2 font-mono text-[11px] text-amber-600 dark:text-indigo-400 font-bold select-all">{ord.id}</td>
                              <td className="py-2.5 px-2 font-semibold text-stone-900 dark:text-white truncate max-w-[120px]" title={ord.companyName}>{ord.companyName}</td>
                              <td className="py-2.5 px-2 text-stone-400 font-normal truncate max-w-[120px]" title={ord.email}>{ord.email}</td>
                              <td className="py-2.5 px-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  ord.plan === 'Enterprise' 
                                    ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400' 
                                    : ord.plan === 'Professional' 
                                    ? 'bg-stone-100 dark:bg-stone-950/40 text-amber-700 dark:text-indigo-400' 
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                }`}>
                                  {ord.plan}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono text-stone-900 dark:text-white">${ord.amount.toFixed(2)}</td>
                              <td className="py-2.5 px-2 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  ord.paymentStatus === 'Settled'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${ord.paymentStatus === 'Settled' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                  {ord.paymentStatus}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  onClick={() => deleteOrder(ord.id)}
                                  id={`delete-record-btn-${ord.id}`}
                                  data-testid={`delete-record-${ord.id}`}
                                  className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
