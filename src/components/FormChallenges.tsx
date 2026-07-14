import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  AlertTriangle,
  Lock,
  X,
  Upload,
  FileUp,
  File,
  Trash2,
  Paperclip
} from 'lucide-react';

interface IndeterminateCheckboxProps {
  id: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'data-testid'?: string;
  className?: string;
}

function IndeterminateCheckbox({
  id,
  checked,
  indeterminate,
  onChange,
  disabled,
  'data-testid': dataTestId,
  className = "h-4 w-4 rounded border-stone-300 dark:border-stone-800 text-amber-600 focus:ring-amber-500 cursor-pointer disabled:opacity-40"
}: IndeterminateCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      id={id}
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      data-testid={dataTestId}
      className={className}
    />
  );
}

export default function FormChallenges() {
  // Scenario 1: Standard Validation
  const [form1, setForm1] = useState({
    username: '',
    email: '',
    age: '',
    tier: 'basic',
    terms: false
  });
  const [errors1, setErrors1] = useState<Record<string, string>>({});
  const [submitted1, setSubmitted1] = useState(false);

  // Scenario 2: Conditional Lock
  const [agreeCodeOfConduct, setAgreeCodeOfConduct] = useState(false);
  const [enableBetaFeatures, setEnableBetaFeatures] = useState(false);
  const [betaKey, setBetaKey] = useState('');
  const [submitted2, setSubmitted2] = useState(false);
  const [error2, setError2] = useState('');

  // Scenario 3: Shuffled ID Forms
  const [shuffledId, setShuffledId] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const [firstNameVal, setFirstNameVal] = useState('');
  const [lastNameVal, setLastNameVal] = useState('');
  const [submitted3, setSubmitted3] = useState(false);

  const handleForm1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (form1.username.trim().length < 5) {
      newErrors.username = 'Username must be at least 5 characters long';
    }
    if (!form1.email.includes('@') || !form1.email.includes('.')) {
      newErrors.email = 'Invalid email address format';
    }
    const ageNum = parseInt(form1.age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      newErrors.age = 'Age must be a valid integer between 18 and 99';
    }
    if (!form1.terms) {
      newErrors.terms = 'You must accept the terms of service';
    }

    setErrors1(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitted1(true);
    } else {
      setSubmitted1(false);
    }
  };

  const handleForm2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeCodeOfConduct) {
      setError2('Unlock requirements unmet.');
      return;
    }
    if (enableBetaFeatures && betaKey !== 'BETA-2026-X') {
      setError2('Invalid beta key code.');
      return;
    }
    setError2('');
    setSubmitted2(true);
  };

  const regenerateShuffledId = () => {
    setShuffledId(Math.floor(1000 + Math.random() * 9000));
    setSubmitted3(false);
  };

  const handleForm3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstNameVal.trim() && lastNameVal.trim()) {
      setSubmitted3(true);
    }
  };

  // Scenario 4: Nested Checkboxes (Permissions Tree) State
  const [permissionState, setPermissionState] = useState({
    admin: { checked: false, indeterminate: false },
    userMgmt: { checked: false, indeterminate: false },
    billing: { checked: false, indeterminate: false },
    createUser: false,
    deleteUser: false,
    viewInvoices: false,
    editBilling: false,
  });
  const [submitted4, setSubmitted4] = useState(false);

  const handlePermissionChange = (nodeId: string, checked: boolean) => {
    setSubmitted4(false);
    setPermissionState((prev) => {
      const next = { ...prev };

      if (nodeId === 'admin') {
        next.admin = { checked, indeterminate: false };
        next.userMgmt = { checked, indeterminate: false };
        next.billing = { checked, indeterminate: false };
        next.createUser = checked;
        next.deleteUser = checked;
        next.viewInvoices = checked;
        next.editBilling = checked;
      } else if (nodeId === 'userMgmt') {
        next.userMgmt = { checked, indeterminate: false };
        next.createUser = checked;
        next.deleteUser = checked;
        recalculatePermissionsUpward(next);
      } else if (nodeId === 'billing') {
        next.billing = { checked, indeterminate: false };
        next.viewInvoices = checked;
        next.editBilling = checked;
        recalculatePermissionsUpward(next);
      } else {
        if (nodeId === 'createUser') next.createUser = checked;
        if (nodeId === 'deleteUser') next.deleteUser = checked;
        if (nodeId === 'viewInvoices') next.viewInvoices = checked;
        if (nodeId === 'editBilling') next.editBilling = checked;
        recalculatePermissionsUpward(next);
      }
      return next;
    });
  };

  const recalculatePermissionsUpward = (next: any) => {
    // User management
    const anyUserChecked = next.createUser || next.deleteUser;
    const allUserChecked = next.createUser && next.deleteUser;
    next.userMgmt = {
      checked: allUserChecked,
      indeterminate: anyUserChecked && !allUserChecked,
    };

    // Billing
    const anyBillingChecked = next.viewInvoices || next.editBilling;
    const allBillingChecked = next.viewInvoices && next.editBilling;
    next.billing = {
      checked: allBillingChecked,
      indeterminate: anyBillingChecked && !allBillingChecked,
    };

    // Admin
    const userChecked = next.userMgmt.checked;
    const userIndeterminate = next.userMgmt.indeterminate;
    const billingChecked = next.billing.checked;
    const billingIndeterminate = next.billing.indeterminate;

    const allChecked = userChecked && billingChecked;
    const noneChecked = !userChecked && !userIndeterminate && !billingChecked && !billingIndeterminate;

    next.admin = {
      checked: allChecked,
      indeterminate: !allChecked && !noneChecked,
    };
  };

  // Scenario 5: Accordion Steps State
  const [activeAccordion, setActiveAccordion] = useState<number | null>(1);
  const [accordionKey, setAccordionKey] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [tokenVerified, setTokenVerified] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitted5, setSubmitted5] = useState(false);
  const [accordionError, setAccordionError] = useState('');

  // Scenario 6: Random/Flaky Interrupts and Delays State
  const [loadingDelay, setLoadingDelay] = useState(false);
  const [delayButtonVisible, setDelayButtonVisible] = useState(false);
  const [delayCompleted, setDelayCompleted] = useState(false);
  const [flakinessEnabled, setFlakinessEnabled] = useState(true);
  const [interruptOpen, setInterruptOpen] = useState(false);
  const [obstacleStatus, setObstacleStatus] = useState<'idle' | 'running' | 'blocked' | 'success'>('idle');

  // Scenario 7: Simulated File Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        clearInterval(uploadTimerRef.current);
      }
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setUploadError('');
    setUploadStatus('idle');
    setUploadProgress(0);

    const allowedMimeTypes = [
      'image/png', 'image/jpeg', 'image/jpg',
      'application/pdf', 'text/csv', 'application/json'
    ];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf', '.csv', '.json'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    const isValidType = allowedMimeTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    if (!isValidType) {
      setUploadError(`Invalid file type: "${file.name}". Only PDF, PNG, JPG, CSV, and JSON files are permitted.`);
      setUploadStatus('error');
      setSelectedFile(null);
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setUploadError(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed size is 5.00 MB.`);
      setUploadStatus('error');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const startSimulatedUpload = () => {
    if (!selectedFile) return;
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError('');

    let progress = 0;
    const intervalTime = 80;
    
    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 6;
      if (progress >= 100) {
        setUploadProgress(100);
        setUploadStatus('success');
        clearInterval(timer);
      } else {
        setUploadProgress(progress);
      }
    }, intervalTime);

    uploadTimerRef.current = timer;
  };

  const cancelUpload = () => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
    }
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  const clearFileSelection = () => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
    }
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadSimulatedPreset = (name: string, sizeMB: number, type: string) => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
    }
    
    // Create a mock File object with the specified size
    const bits = ['a'.repeat(Math.floor(sizeMB * 1024 * 1024))];
    const mockFile = new File(bits, name, { type });
    validateAndSetFile(mockFile);
  };

  return (
    <div id="forms-challenges-root" className="space-y-8">
      {/* Overview Block */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm">
        <h2 className="text-2xl font-semibold font-display text-stone-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" />
          Input Forms & Validations Arena
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Practice standard validations, sequence clicks, conditional locks, and handle dynamic ID shufflers. Target key attributes and handle real error boundaries.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Scenario 1: Validation Rules */}
        <div id="challenge-validation-form" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xs flex flex-col p-6">
          <div className="flex items-start justify-between mb-4 border-b border-stone-50 dark:border-stone-800 pb-4">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-green-50 dark:bg-emerald-950/30 text-green-700 dark:text-emerald-400 border border-green-100 dark:border-emerald-900/30">
                Beginner
              </span>
              <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2">
                1. Dynamic Form Validations
              </h3>
            </div>
            <HelpCircle className="w-4 h-4 text-stone-400" title="Validates error assertions and correct submission states" />
          </div>

          <form onSubmit={handleForm1Submit} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label htmlFor="form1-username" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="form1-username"
                data-testid="username-input"
                type="text"
                placeholder="Enter 5+ chars"
                value={form1.username}
                onChange={(e) => setForm1({ ...form1, username: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 ${
                  errors1.username
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-stone-200 dark:border-stone-800 focus:ring-amber-500'
                }`}
              />
              {errors1.username && (
                <p id="error-username" data-testid="error-username" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors1.username}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="form1-email" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="form1-email"
                data-testid="email-input"
                type="text"
                placeholder="user@example.com"
                value={form1.email}
                onChange={(e) => setForm1({ ...form1, email: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 ${
                  errors1.email
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-stone-200 dark:border-stone-800 focus:ring-amber-500'
                }`}
              />
              {errors1.email && (
                <p id="error-email" data-testid="error-email" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors1.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="form1-age" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Age (18-99) <span className="text-red-500">*</span>
              </label>
              <input
                id="form1-age"
                data-testid="age-input"
                type="number"
                placeholder="e.g. 25"
                value={form1.age}
                onChange={(e) => setForm1({ ...form1, age: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 ${
                  errors1.age
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-stone-200 dark:border-stone-800 focus:ring-amber-500'
                }`}
              />
              {errors1.age && (
                <p id="error-age" data-testid="error-age" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors1.age}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="form1-tier" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Subscription Tier
              </label>
              <select
                id="form1-tier"
                data-testid="tier-select"
                value={form1.tier}
                onChange={(e) => setForm1({ ...form1, tier: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="basic">Basic (Free)</option>
                <option value="premium">Premium ($10/mo)</option>
                <option value="enterprise">Enterprise ($99/mo)</option>
              </select>
            </div>

            <div className="flex items-start mt-2">
              <input
                id="form1-terms"
                data-testid="terms-checkbox"
                type="checkbox"
                checked={form1.terms}
                onChange={(e) => setForm1({ ...form1, terms: e.target.checked })}
                className="h-4 w-4 mt-0.5 rounded border-stone-300 dark:border-stone-800 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="form1-terms" className="ml-2 block text-xs text-stone-600 dark:text-stone-400 select-none">
                I accept the terms and conditions
              </label>
            </div>
            {errors1.terms && (
              <p id="error-terms" data-testid="error-terms" className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> {errors1.terms}
              </p>
            )}

            <div className="mt-auto pt-4 border-t border-stone-50 dark:border-stone-800">
              <button
                id="submit-validation-form"
                data-testid="form1-submit-btn"
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Submit Form
              </button>
            </div>
          </form>

          {/* Success Dialog */}
          {submitted1 && (
            <div id="form-success-banner" data-testid="success-banner" className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span><strong>Validation Passed!</strong> Full client profile processed.</span>
            </div>
          )}
        </div>

        {/* Scenario 2: Conditional Lock & State Sequencing */}
        <div id="challenge-conditional-locks" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xs flex flex-col p-6">
          <div className="flex items-start justify-between mb-4 border-b border-stone-50 dark:border-stone-800 pb-4">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                Intermediate
              </span>
              <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2">
                2. State & Sequence Locks
              </h3>
            </div>
            <HelpCircle className="w-4 h-4 text-stone-400" title="Verifies how your script handles disabled/enabled triggers and toggle conditional fields" />
          </div>

          <form onSubmit={handleForm2Submit} className="space-y-4 flex-1 flex flex-col">
            {/* Action 1: The Toggle Gate */}
            <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
              <div className="flex items-start">
                <input
                  id="gate-code-conduct"
                  data-testid="gate-code-checkbox"
                  type="checkbox"
                  checked={agreeCodeOfConduct}
                  onChange={(e) => {
                    setAgreeCodeOfConduct(e.target.checked);
                    if (!e.target.checked) {
                      setEnableBetaFeatures(false);
                      setBetaKey('');
                    }
                  }}
                  className="h-4 w-4 mt-0.5 rounded border-stone-300 dark:border-stone-800 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="gate-code-conduct" className="ml-2 block text-xs font-semibold text-stone-700 dark:text-stone-300 select-none">
                  Agree to the Sandbox Code of Conduct
                </label>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 ml-6 mt-0.5">
                Checking this triggers enablement of the subsequent sub-options.
              </p>
            </div>

            {/* Action 2: Trigger Field */}
            <div className="space-y-2">
              <div className="flex items-start">
                <input
                  id="gate-beta-features"
                  data-testid="gate-beta-checkbox"
                  type="checkbox"
                  disabled={!agreeCodeOfConduct}
                  checked={enableBetaFeatures}
                  onChange={(e) => {
                    setEnableBetaFeatures(e.target.checked);
                    if (!e.target.checked) setBetaKey('');
                  }}
                  className="h-4 w-4 mt-0.5 rounded border-stone-300 dark:border-stone-800 text-amber-600 focus:ring-amber-500 disabled:opacity-40"
                />
                <label
                  htmlFor="gate-beta-features"
                  className={`ml-2 block text-xs font-semibold select-none ${
                    agreeCodeOfConduct ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400 dark:text-stone-600'
                  }`}
                >
                  Enable Advanced Beta Access
                </label>
              </div>
            </div>

            {/* Action 3: Hidden Input dependent on Gate */}
            <div className="transition-all duration-200">
              <label
                htmlFor="gate-beta-key"
                className={`block text-xs font-semibold mb-1 ${
                  enableBetaFeatures ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400 dark:text-stone-600'
                }`}
              >
                Access Beta Key Code
              </label>
              <input
                id="gate-beta-key"
                data-testid="beta-key-input"
                type="text"
                disabled={!enableBetaFeatures}
                placeholder="e.g. BETA-2026-X"
                value={betaKey}
                onChange={(e) => setBetaKey(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-stone-100 dark:disabled:bg-stone-800/40 disabled:cursor-not-allowed ${
                  enableBetaFeatures ? 'border-amber-300' : 'border-stone-200 dark:border-stone-800'
                }`}
              />
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                Must match exact code: <code className="font-mono bg-stone-50 dark:bg-stone-800 px-1 rounded">BETA-2026-X</code>
              </p>
            </div>

            {error2 && (
              <p id="error2-banner" data-testid="gate-error" className="text-xs text-red-500 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error2}
              </p>
            )}

            <div className="mt-auto pt-4 border-t border-stone-50 dark:border-stone-800">
              <button
                id="submit-gate-form"
                data-testid="gate-submit-btn"
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Enroll in Beta Sandbox
              </button>
            </div>
          </form>

          {submitted2 && (
            <div id="gate-success-banner" data-testid="gate-success" className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span><strong>Sequencing Cleared!</strong> Beta credentials validated successfully.</span>
            </div>
          )}
        </div>

        {/* Scenario 3: Shuffled ID Forms (xpath test) */}
        <div id="challenge-shuffled-ids" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xs flex flex-col p-6">
          <div className="flex items-start justify-between mb-4 border-b border-stone-50 dark:border-stone-800 pb-4">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                Advanced
              </span>
              <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2">
                3. Shuffled ID Attributes
              </h3>
            </div>
            <button
              id="regenerate-shuffled-ids"
              onClick={regenerateShuffledId}
              className="p-1 text-stone-400 hover:text-purple-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-all"
              title="Force reload IDs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-4 bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/30 p-3 rounded-xl text-xs text-purple-800 dark:text-purple-400 leading-relaxed">
            <p>
              The HTML <code>id</code> and <code>name</code> tags for this form regenerate random numeric suffixes on render. 
              <strong> Current suffix: <code className="font-mono bg-purple-100 dark:bg-purple-900 px-1 rounded">{shuffledId}</code></strong>
            </p>
            <p className="mt-1 font-semibold">
              Strategy: Do not use ID selectors! Pin via stable <code>data-automation</code> labels, placeholder text, or preceding label hierarchies.
            </p>
          </div>

          <form onSubmit={handleForm3Submit} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label
                htmlFor={`first-name-input_${shuffledId}`}
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id={`first-name-input_${shuffledId}`}
                name={`fname_field_${shuffledId}`}
                data-automation="user-first-name"
                type="text"
                placeholder="E.g. Alan"
                value={firstNameVal}
                onChange={(e) => setFirstNameVal(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label
                htmlFor={`last-name-input_${shuffledId}`}
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id={`last-name-input_${shuffledId}`}
                name={`lname_field_${shuffledId}`}
                data-automation="user-last-name"
                type="text"
                placeholder="E.g. Turing"
                value={lastNameVal}
                onChange={(e) => setLastNameVal(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="mt-auto pt-4 border-t border-stone-50 dark:border-stone-800">
              <button
                id={`submit-shuffled-btn_${shuffledId}`}
                data-automation="user-shuffled-submit"
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Submit Shuffled
              </button>
            </div>
          </form>

          {submitted3 && (
            <div id="shuffled-success-banner" data-automation="shuffled-success" className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span><strong>Shuffled Form Submitted!</strong> Used ID independent selector successfully!</span>
            </div>
          )}
        </div>

      </div>

      {/* Advanced UI Interaction Arena Section Divider */}
      <div className="border-t border-stone-100 dark:border-stone-800/60 pt-6 mt-8">
        <h3 className="text-lg font-semibold font-display text-stone-800 dark:text-stone-200">
          Complex UI Interactions & Advanced Control Arena
        </h3>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
          Simulate nested configuration trees, sequential accordion navigation, dynamic asynchronous timings, and random popup interrupt dialogs.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Scenario 4: Nested Checkboxes (Permissions Tree) */}
        <div id="challenge-nested-checkboxes" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xs flex flex-col p-6">
          <div className="flex items-start justify-between mb-4 border-b border-stone-50 dark:border-stone-800 pb-4">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-stone-50 dark:bg-stone-950/30 text-amber-700 dark:text-indigo-400 border border-stone-100 dark:border-amber-900/30">
                Intermediate
              </span>
              <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                4. Nested Permissions Tree
              </h3>
            </div>
            <HelpCircle className="w-4 h-4 text-stone-400" title="Verifies nested checkbox propagation and indeterminate states" />
          </div>

          <div className="mb-4 bg-stone-50/40 dark:bg-stone-950/10 border border-stone-100/50 dark:border-amber-900/20 p-3 rounded-xl text-[11px] text-amber-800 dark:text-indigo-400 leading-relaxed">
            Selecting a parent toggles all child permissions. Partial child selections trigger the <strong className="font-semibold">indeterminate</strong> state on their parent and grand-parent elements.
          </div>

          <div className="space-y-4 flex-1">
            {/* Level 1: Grandparent */}
            <div className="flex items-center gap-2 font-semibold text-xs text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-950 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800/80">
              <IndeterminateCheckbox
                id="perm-admin"
                data-testid="perm-admin"
                checked={permissionState.admin.checked}
                indeterminate={permissionState.admin.indeterminate}
                onChange={(chk) => handlePermissionChange('admin', chk)}
              />
              <label htmlFor="perm-admin" className="cursor-pointer select-none">
                System Admin Authorization <span className="text-[10px] text-stone-400 font-mono">({permissionState.admin.checked ? 'Checked' : permissionState.admin.indeterminate ? 'Indeterminate' : 'Unchecked'})</span>
              </label>
            </div>

            {/* Level 2: Parents & Children */}
            <div className="pl-5 space-y-4">
              
              {/* Parent A: User Mgmt */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-xs text-stone-700 dark:text-stone-300">
                  <IndeterminateCheckbox
                    id="perm-userMgmt"
                    data-testid="perm-user-mgmt"
                    checked={permissionState.userMgmt.checked}
                    indeterminate={permissionState.userMgmt.indeterminate}
                    onChange={(chk) => handlePermissionChange('userMgmt', chk)}
                  />
                  <label htmlFor="perm-userMgmt" className="cursor-pointer select-none">
                    User Management Module
                  </label>
                </div>
                {/* Children A */}
                <div className="pl-6 space-y-1.5 border-l border-stone-100 dark:border-stone-800 ml-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <IndeterminateCheckbox
                      id="perm-createUser"
                      data-testid="perm-create-user"
                      checked={permissionState.createUser}
                      onChange={(chk) => handlePermissionChange('createUser', chk)}
                    />
                    <label htmlFor="perm-createUser" className="cursor-pointer select-none">
                      Create User Access
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <IndeterminateCheckbox
                      id="perm-deleteUser"
                      data-testid="perm-delete-user"
                      checked={permissionState.deleteUser}
                      onChange={(chk) => handlePermissionChange('deleteUser', chk)}
                    />
                    <label htmlFor="perm-deleteUser" className="cursor-pointer select-none">
                      Delete User Access
                    </label>
                  </div>
                </div>
              </div>

              {/* Parent B: Billing */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-xs text-stone-700 dark:text-stone-300">
                  <IndeterminateCheckbox
                    id="perm-billing"
                    data-testid="perm-billing"
                    checked={permissionState.billing.checked}
                    indeterminate={permissionState.billing.indeterminate}
                    onChange={(chk) => handlePermissionChange('billing', chk)}
                  />
                  <label htmlFor="perm-billing" className="cursor-pointer select-none">
                    Billing & Invoicing Module
                  </label>
                </div>
                {/* Children B */}
                <div className="pl-6 space-y-1.5 border-l border-stone-100 dark:border-stone-800 ml-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <IndeterminateCheckbox
                      id="perm-viewInvoices"
                      data-testid="perm-view-invoices"
                      checked={permissionState.viewInvoices}
                      onChange={(chk) => handlePermissionChange('viewInvoices', chk)}
                    />
                    <label htmlFor="perm-viewInvoices" className="cursor-pointer select-none">
                      View Invoices Access
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <IndeterminateCheckbox
                      id="perm-editBilling"
                      data-testid="perm-edit-billing"
                      checked={permissionState.editBilling}
                      onChange={(chk) => handlePermissionChange('editBilling', chk)}
                    />
                    <label htmlFor="perm-editBilling" className="cursor-pointer select-none">
                      Edit Billing Info
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-50 dark:border-stone-800">
            <button
              id="submit-permissions-btn"
              data-testid="submit-permissions-btn"
              onClick={() => {
                if (permissionState.admin.checked || permissionState.createUser || permissionState.deleteUser || permissionState.viewInvoices || permissionState.editBilling) {
                  setSubmitted4(true);
                }
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Save Permission Settings
            </button>
          </div>

          {submitted4 && (
            <div id="permissions-success-banner" data-testid="permissions-success" className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span><strong>Permissions Saved!</strong> Auth package synced with active directory.</span>
            </div>
          )}
        </div>

        {/* Scenario 5: Accordion Steps (Collapsibles) */}
        <div id="challenge-accordion-steps" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xs flex flex-col p-6">
          <div className="flex items-start justify-between mb-4 border-b border-stone-50 dark:border-stone-800 pb-4">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                Intermediate
              </span>
              <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-500" />
                5. Sequenced Accordion Gates
              </h3>
            </div>
            <HelpCircle className="w-4 h-4 text-stone-400" title="Verifies opening/closing of collapsibles, copying keys across panels, and submitting state-based forms" />
          </div>

          <div className="mb-4 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 p-3 rounded-xl text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
            Standard accordion flow. Only one panel can be open at a time. Collapse actions hide nested DOM elements, requiring the scraper/automation to remember tokens.
          </div>

          <div className="space-y-3 flex-1">
            
            {/* Step 1 panel */}
            <div className="border border-stone-100 dark:border-stone-800 rounded-xl overflow-hidden">
              <button
                id="accordion-header-1"
                data-testid="accordion-header-1"
                onClick={() => {
                  setActiveAccordion(activeAccordion === 1 ? null : 1);
                  setSubmitted5(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-950 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900/50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${accordionKey ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-700'}`}>1</span>
                  Step 1: Token Generation
                </span>
                {activeAccordion === 1 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === 1 && (
                  <motion.div
                    key="content-1"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div id="accordion-content-1" className="p-3 bg-white dark:bg-stone-900 text-xs space-y-2 border-t border-stone-50 dark:border-stone-800">
                      <p className="text-stone-500">Generate the temporary key that must be pasted in the next step.</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id="accordion-generate-btn"
                          data-testid="accordion-generate-btn"
                          onClick={() => setAccordionKey('KEY-404-SECURE')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Generate Key
                        </button>
                        {accordionKey && (
                          <span className="font-mono bg-stone-100 dark:bg-stone-950 px-2 py-1 rounded text-amber-600 dark:text-amber-400" id="accordion-key-val" data-testid="accordion-key-val">
                            {accordionKey}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 2 panel */}
            <div className="border border-stone-100 dark:border-stone-800 rounded-xl overflow-hidden">
              <button
                id="accordion-header-2"
                data-testid="accordion-header-2"
                onClick={() => {
                  setActiveAccordion(activeAccordion === 2 ? null : 2);
                  setSubmitted5(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-950 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900/50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${tokenVerified ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-700'}`}>2</span>
                  Step 2: Key Verification
                </span>
                {activeAccordion === 2 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === 2 && (
                  <motion.div
                    key="content-2"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div id="accordion-content-2" className="p-3 bg-white dark:bg-stone-900 text-xs space-y-3 border-t border-stone-50 dark:border-stone-800">
                      <p className="text-stone-500">Provide the token generated in the previous step. (Requires expanding Step 1 to grab it first).</p>
                      <div>
                        <label htmlFor="accordion-token-input" className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Security Token
                        </label>
                        <input
                          id="accordion-token-input"
                          data-testid="accordion-token-input"
                          type="text"
                          placeholder="Paste key here"
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id="accordion-verify-btn"
                          data-testid="accordion-verify-btn"
                          onClick={() => {
                            if (tokenInput.trim() === 'KEY-404-SECURE') {
                              setTokenVerified(true);
                              setAccordionError('');
                              setActiveAccordion(3); // Auto go to step 3 on success
                            } else {
                              setAccordionError('Incorrect security token.');
                              setTokenVerified(false);
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Verify Token
                        </button>
                        {tokenVerified && <span className="text-emerald-600 text-[11px] font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Validated!</span>}
                      </div>
                      {accordionError && <p className="text-red-500 text-[10px]" id="accordion-error-msg">{accordionError}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 3 panel */}
            <div className="border border-stone-100 dark:border-stone-800 rounded-xl overflow-hidden">
              <button
                id="accordion-header-3"
                data-testid="accordion-header-3"
                onClick={() => {
                  setActiveAccordion(activeAccordion === 3 ? null : 3);
                  setSubmitted5(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-950 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900/50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${submitted5 ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-700'}`}>3</span>
                  Step 3: Secure Finalization
                </span>
                {activeAccordion === 3 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === 3 && (
                  <motion.div
                    key="content-3"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div id="accordion-content-3" className="p-3 bg-white dark:bg-stone-900 text-xs space-y-3 border-t border-stone-50 dark:border-stone-800">
                      <p className="text-stone-500">Sign off and submit. Submit button will remain disabled until key verification is completely cleared.</p>
                      
                      <div className="flex items-start">
                        <input
                          id="accordion-consent-checkbox"
                          data-testid="accordion-consent-checkbox"
                          type="checkbox"
                          checked={consentChecked}
                          onChange={(e) => setConsentChecked(e.target.checked)}
                          className="h-4 w-4 mt-0.5 rounded border-stone-300 dark:border-stone-800 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <label htmlFor="accordion-consent-checkbox" className="ml-2 block text-[11px] text-stone-600 dark:text-stone-400 select-none cursor-pointer">
                          I authorize this automation run & agree to full submission.
                        </label>
                      </div>

                      <button
                        id="accordion-submit-btn"
                        data-testid="accordion-submit-btn"
                        disabled={!tokenVerified || !consentChecked}
                        onClick={() => setSubmitted5(true)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Authorize Session Release
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {submitted5 && (
            <div id="accordion-success-banner" data-testid="accordion-success" className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span><strong>Accordion Completed!</strong> Seq Token verified & final release authorized.</span>
            </div>
          )}
        </div>

        {/* Scenario 6: Random Intercepts & Timing (Obstacles & Hidden Elements) */}
        <div id="challenge-flaky-interrupts" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xs flex flex-col p-6 relative overflow-hidden">
          
          <div className="flex items-start justify-between mb-4 border-b border-stone-50 dark:border-stone-800 pb-4">
            <div>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                Advanced
              </span>
              <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                6. Async Delays & Flaky Dialogs
              </h3>
            </div>
            <HelpCircle className="w-4 h-4 text-stone-400" title="Verifies dynamic async waiting and resilience to sudden random popup intercepts" />
          </div>

          <div className="mb-4 bg-purple-50/40 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/20 p-3 rounded-xl text-[11px] text-purple-800 dark:text-purple-400 leading-relaxed space-y-1">
            <p>1. Start the delay loader. A hidden action button will appear after 1.5s - 3.5s.</p>
            <p>2. Try to complete the final run. Pop-up interrupts might dynamically obscure inputs if enabled.</p>
          </div>

          {/* Action A: Delayed Trigger */}
          <div className="space-y-3 bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-800 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">1. Asynchronous Delay Obstacle</span>
              {delayCompleted && <span className="text-emerald-600 text-[10px] font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Step Cleared</span>}
            </div>
            <p className="text-[10px] text-stone-400 leading-normal">
              Click to initiate a simulated background computation. Locate and trigger the secondary button immediately when it mounts.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="start-delay-timer-btn"
                data-testid="start-delay-timer-btn"
                disabled={loadingDelay}
                onClick={() => {
                  setLoadingDelay(true);
                  setDelayButtonVisible(false);
                  setDelayCompleted(false);
                  const delay = 1500 + Math.random() * 2000;
                  setTimeout(() => {
                    setLoadingDelay(false);
                    setDelayButtonVisible(true);
                  }, delay);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-[10px] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
              >
                {loadingDelay && <RefreshCw className="w-3 h-3 animate-spin" />}
                {loadingDelay ? 'Computing...' : 'Start Delay Timer'}
              </button>

              {delayButtonVisible && (
                <button
                  id="delayed-action-btn"
                  data-testid="delayed-action-btn"
                  onClick={() => {
                    setDelayCompleted(true);
                    setDelayButtonVisible(false);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[10px] transition-all animate-bounce cursor-pointer"
                >
                  Click Me To Proceed!
                </button>
              )}
            </div>
          </div>

          {/* Action B: Flaky Interrupt Popups */}
          <div className="space-y-3 flex-1 flex flex-col justify-end">
            <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-3">
              <label htmlFor="flakiness-toggle" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                2. Inject Random Intercepts
              </label>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="flakiness-toggle"
                  data-testid="flakiness-toggle"
                  checked={flakinessEnabled}
                  onChange={(e) => {
                    setFlakinessEnabled(e.target.checked);
                    if (!e.target.checked) setInterruptOpen(false);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 leading-normal">
              When toggled ON, executing a process has a 50% likelihood of triggering an unexpected fullscreen alert that locks up and shields the execution pipeline.
            </p>

            <button
              id="execute-secure-run-btn"
              data-testid="execute-secure-run-btn"
              onClick={() => {
                setObstacleStatus('running');
                if (flakinessEnabled && Math.random() > 0.4) {
                  setInterruptOpen(true);
                  setObstacleStatus('blocked');
                } else {
                  setObstacleStatus('success');
                }
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer mt-2"
            >
              Execute Secure Process
            </button>

            {obstacleStatus === 'success' && (
              <div id="obstacle-success-toast" data-testid="obstacle-success" className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span><strong>Process Executed!</strong> Bypass sequence successfully handled random intercepts.</span>
              </div>
            )}

            {obstacleStatus === 'blocked' && (
              <div id="obstacle-blocked-alert" className="mt-2 p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span><strong>Execution Blocked!</strong> A dynamic popup dialog obscured input targets.</span>
              </div>
            )}
          </div>

          {/* Random Overlay Dialogue Dialog */}
          {interruptOpen && (
            <div 
              id="interrupt-popup"
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-40 animate-fade-in"
            >
              <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-red-100 dark:border-red-950 max-w-[240px] shadow-xl space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
                <div>
                  <h4 className="text-xs font-semibold text-stone-900 dark:text-white">System Interrupt Alert!</h4>
                  <p className="text-[10px] text-stone-400 mt-1">A dynamic network exception popup occurred unexpectedly during input focus.</p>
                </div>
                <button
                  id="dismiss-interrupt-btn"
                  data-testid="dismiss-interrupt-btn"
                  onClick={() => {
                    setInterruptOpen(false);
                    setObstacleStatus('idle');
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-3 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" /> Dismiss Interrupt
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* File Operations Arena Section Divider */}
      <div className="border-t border-stone-100 dark:border-stone-800/60 pt-6 mt-8">
        <h3 className="text-lg font-semibold font-display text-stone-800 dark:text-stone-200">
          Secure Document Ingest & File Sandbox
        </h3>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
          Practice drag-and-drop secure file uploads, asynchronous progress monitoring, cancel events, and file type/size validation limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="challenge-file-sandbox">
        {/* Left column - Sandbox Configuration & Instructions */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between border-b border-stone-50 dark:border-stone-800 pb-3 mb-4">
              <div>
                <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-stone-50 dark:bg-stone-950/30 text-amber-700 dark:text-indigo-400 border border-stone-100 dark:border-amber-900/30">
                  Expert Challenge
                </span>
                <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2 flex items-center gap-1.5">
                  <FileUp className="w-5 h-5 text-amber-500" />
                  7. Upload Rules & Presets
                </h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-stone-500 dark:text-stone-400">
              <p className="leading-relaxed">
                Automating file uploads requires selecting files dynamically or simulating drop events on targeted drop zones. Test compliance bounds using these constraints:
              </p>
              
              <ul className="space-y-1.5 list-disc pl-4 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                <li>Max Allowed Size: <strong className="text-stone-800 dark:text-stone-300">5.00 MB</strong></li>
                <li>Permitted Extensions: <strong className="text-stone-800 dark:text-stone-300">.pdf, .png, .jpg, .csv, .json</strong></li>
              </ul>

              <div className="pt-3 border-t border-stone-50 dark:border-stone-800/60">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                  Sandbox Simulation Presets:
                </span>
                <p className="text-[11px] text-stone-400 mb-3">No files on your system? Instantly populate mock files into the uploader zone to verify validator states:</p>
                
                <div className="space-y-2">
                  <button
                    type="button"
                    id="preset-valid-pdf"
                    data-testid="preset-valid-pdf"
                    onClick={() => loadSimulatedPreset('security_report.pdf', 1.4, 'application/pdf')}
                    className="w-full text-left p-2 bg-stone-50 dark:bg-stone-950 hover:bg-stone-50/50 dark:hover:bg-stone-950/20 border border-stone-100 dark:border-stone-800/80 rounded-xl transition-all flex items-center justify-between text-[11px] group cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-indigo-400">
                      <Paperclip className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      security_report.pdf
                    </span>
                    <span className="font-mono text-stone-400 text-[10px]">1.4 MB (Valid)</span>
                  </button>

                  <button
                    type="button"
                    id="preset-invalid-ext"
                    data-testid="preset-invalid-ext"
                    onClick={() => loadSimulatedPreset('unauthorized_script.exe', 0.8, 'application/x-msdownload')}
                    className="w-full text-left p-2 bg-stone-50 dark:bg-stone-950 hover:bg-red-50/40 dark:hover:bg-red-950/10 border border-stone-100 dark:border-stone-800/80 rounded-xl transition-all flex items-center justify-between text-[11px] group cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      unauthorized_script.exe
                    </span>
                    <span className="font-mono text-stone-400 text-[10px]">820 KB (Invalid Type)</span>
                  </button>

                  <button
                    type="button"
                    id="preset-too-large"
                    data-testid="preset-too-large"
                    onClick={() => loadSimulatedPreset('massive_database_dump.json', 12.8, 'application/json')}
                    className="w-full text-left p-2 bg-stone-50 dark:bg-stone-950 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 border border-stone-100 dark:border-stone-800/80 rounded-xl transition-all flex items-center justify-between text-[11px] group cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      <File className="w-3.5 h-3.5 text-amber-500" />
                      large_database_dump.json
                    </span>
                    <span className="font-mono text-stone-400 text-[10px]">12.8 MB (Too Large)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Drag-and-Drop Uploader Widget (Spans 2 cols on wide screens) */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">
                Interactive Drag-and-Drop Area
              </h4>
              <p className="text-xs text-stone-400">
                Supports drop interactions or standard mouse click triggers. Live indicators report file upload velocity.
              </p>
            </div>

            {/* Drag Zone Area */}
            <div
              id="file-dropzone-area"
              data-testid="file-dropzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                if (uploadStatus !== 'uploading' && uploadStatus !== 'success') {
                  fileInputRef.current?.click();
                }
              }}
              className={`mt-4 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[220px] ${
                dragActive
                  ? 'border-amber-500 bg-stone-50/30 dark:bg-stone-950/20 scale-[0.99]'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-50/5 dark:bg-emerald-950/5'
                  : 'border-stone-200 dark:border-stone-800 hover:border-indigo-400 dark:hover:border-stone-700 bg-stone-50/30 dark:bg-stone-950/40'
              }`}
            >
              <input
                type="file"
                id="file-hidden-input"
                data-testid="file-hidden-input"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.csv,.json"
              />

              {!selectedFile && (
                <div className="space-y-3 pointer-events-none">
                  <div className="mx-auto w-12 h-12 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-amber-500 dark:text-indigo-400">
                    <Upload className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                      Drag & Drop your document here, or <span className="text-amber-600 dark:text-indigo-400 font-bold">browse folders</span>
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      PDF, PNG, JPG, CSV, JSON (Maximum 5MB)
                    </p>
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="space-y-4 w-full max-w-md pointer-events-none">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl shadow-xs text-left">
                    <div className="p-2 bg-stone-50 dark:bg-stone-950 rounded-lg text-amber-500 shrink-0">
                      <File className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate" id="selected-file-name" data-testid="selected-file-name">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Size: <span id="selected-file-size" className="font-semibold text-stone-700 dark:text-stone-300">{(selectedFile.size / 1024).toFixed(1)} KB</span> | Type: {selectedFile.type || 'Unknown'}
                      </p>
                    </div>
                    {uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
                      <button
                        type="button"
                        id="clear-file-btn"
                        data-testid="clear-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          clearFileSelection();
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-all pointer-events-auto cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error notifications */}
            {uploadError && (
              <div id="file-error-toast" data-testid="file-error" className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-400 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{uploadError}</span>
              </div>
            )}

            {/* Asynchronous Upload Control Dashboard */}
            {selectedFile && (
              <div className="mt-4 pt-4 border-t border-stone-50 dark:border-stone-800/80 space-y-3">
                {uploadStatus === 'idle' && (
                  <button
                    type="button"
                    id="trigger-file-upload"
                    data-testid="trigger-file-upload"
                    onClick={startSimulatedUpload}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Upload className="w-4 h-4" /> Start Simulated Secure Ingest
                  </button>
                )}

                {uploadStatus === 'uploading' && (
                  <div className="space-y-2.5" id="upload-progress-container">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                        Uploading to secure core...
                      </span>
                      <span className="font-mono" id="upload-progress-text">{uploadProgress}%</span>
                    </div>

                    {/* Progress slider layout */}
                    <div className="w-full h-2 bg-stone-100 dark:bg-stone-950 rounded-full overflow-hidden border border-stone-50 dark:border-stone-900">
                      <div
                        id="upload-progress-bar"
                        className="h-full bg-amber-600 transition-all duration-100 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-stone-400">
                      <span>Speed: ~2.4 MB/s | Encrypted SSL</span>
                      <button
                        type="button"
                        id="cancel-upload-btn"
                        data-testid="cancel-upload-btn"
                        onClick={cancelUpload}
                        className="text-red-500 dark:text-red-400 hover:underline font-semibold cursor-pointer"
                      >
                        Cancel Upload
                      </button>
                    </div>
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <div className="space-y-3 animate-fade-in" id="upload-success-container">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                      <div>
                        <p className="font-bold">File Securely Ingested!</p>
                        <p className="text-[10px] opacity-90 mt-0.5">Checksum verify completed. Data has been synced to cluster backend.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="upload-another-btn"
                      data-testid="upload-another-btn"
                      onClick={clearFileSelection}
                      className="w-full bg-stone-100 dark:bg-stone-950 hover:bg-stone-200 dark:hover:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Clear & Upload Another File
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
