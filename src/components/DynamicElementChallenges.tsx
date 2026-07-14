import React, { useState, useEffect, useRef } from 'react';
import { Layers, Timer, Zap, AlertTriangle, Eye, EyeOff, CheckCircle2, ShieldAlert, Lock, Unlock, RefreshCw, Fingerprint } from 'lucide-react';

export default function DynamicElementChallenges() {
  // Scenario 1: Delayed element
  const [delayActive, setDelayActive] = useState(false);
  const [delayCompleted, setDelayCompleted] = useState(false);
  const [delayProgress, setDelayProgress] = useState(0);

  // Scenario 2: Disappearing element
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertSecondsLeft, setAlertSecondsLeft] = useState(0);

  // Scenario 3: Cyclic text
  const [statusText, setStatusText] = useState('Status: System Idle');
  const STATUSES = [
    'Status: System Idle',
    'Status: Syncing Repositories',
    'Status: Compiling Test Suite',
    'Status: Resolving Port Ingress',
    'Status: Executing Selenium Grid',
    'Status: All Tests Passed'
  ];

  // Scenario 4: Click Interception / Z-Index Overlay
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [clickLog, setClickLog] = useState<string[]>([]);

  // Scenario 5: Hover-Activated Hidden Info
  const [hoverProgress, setHoverProgress] = useState(0);
  const [hoverCompleted, setHoverCompleted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for Scenario 1
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (delayActive) {
      setDelayProgress(0);
      setDelayCompleted(false);
      const interval = setInterval(() => {
        setDelayProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setDelayActive(false);
            setDelayCompleted(true);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [delayActive]);

  // Timer for Scenario 2
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAlertVisible && alertSecondsLeft > 0) {
      timer = setTimeout(() => {
        setAlertSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (alertSecondsLeft === 0) {
      setIsAlertVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isAlertVisible, alertSecondsLeft]);

  // Rotator for Scenario 3
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * STATUSES.length);
      setStatusText(STATUSES[randomIdx]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerDelayTimer = () => {
    setDelayActive(true);
    setDelayCompleted(false);
    setDelayProgress(0);
  };

  const triggerDisappearingAlert = () => {
    setIsAlertVisible(true);
    setAlertSecondsLeft(4);
  };

  const handleTargetClick = () => {
    if (isOverlayOpen) {
      // In web development, pointer-events: none on the overlay or absolute positioning can allow clicking through,
      // but if we simulate standard layout coverage, we'll let the user click it, and record a "Success" if they forced it,
      // but also demonstrate why the overlay blocks visual clicks.
      setClickLog(prev => [`[WARNING] Obscured Click Attempted at ${new Date().toLocaleTimeString()}`, ...prev]);
    } else {
      setClickCount(prev => prev + 1);
      setClickLog(prev => [`[SUCCESS] Click registered at ${new Date().toLocaleTimeString()} (Count: ${clickCount + 1})`, ...prev]);
    }
  };

  // Clean up hover interval on unmount
  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverCompleted) return;
    setIsHovering(true);
    setHoverProgress(0);
    
    const startTime = Date.now();
    const duration = 3000; // 3 seconds
    
    hoverIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      
      setHoverProgress(progress);
      
      if (elapsed >= duration) {
        setHoverCompleted(true);
        setIsHovering(false);
        if (hoverIntervalRef.current) {
          clearInterval(hoverIntervalRef.current);
        }
      }
    }, 50);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
    }
    if (!hoverCompleted) {
      setHoverProgress(0);
    }
  };

  const handleResetHover = () => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
    }
    setHoverProgress(0);
    setHoverCompleted(false);
    setIsHovering(false);
  };

  return (
    <div id="dynamic-challenges-root" className="space-y-8">
      {/* Overview Block */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <h2 className="text-2xl font-semibold font-display text-stone-900 dark:text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-amber-500" />
          Dynamic Elements & Z-Index Arena
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Challenge your test cases against modern client-side dynamic states. Practice synchronization waits, catch elusive disappearing alerts, and master click-blocking overlay closures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Challenge 1 & 2 Panel */}
        <div className="space-y-6 flex flex-col">
          
          {/* Asynchronous Delayed Element */}
          <div id="delayed-element-card" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
                <div>
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                    Intermediate
                  </span>
                  <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2">
                    1. Asynchronous Delayed Element
                  </h3>
                </div>
                <Timer className="w-5 h-5 text-amber-500" />
              </div>
              
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                Clicking the trigger initiates a 3-second timer. A success button is injected only after the timer finishes.
                Your automation scripts must poll or wait specifically for <code>id="delayed-success-btn"</code> to become visible.
              </p>

              <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col items-center justify-center min-h-[100px] mb-4">
                {delayActive && (
                  <div className="w-full text-center space-y-2">
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                      Retrieving element from mock service...
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div
                        id="delay-progress-bar"
                        style={{ width: `${delayProgress}%` }}
                        className="bg-amber-600 h-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {!delayActive && !delayCompleted && (
                  <span id="delay-status-text" className="text-xs text-stone-400 dark:text-stone-500 italic">
                    Waiting for trigger...
                  </span>
                )}

                {delayCompleted && (
                  <button
                    id="delayed-success-btn"
                    data-testid="delayed-btn-success"
                    onClick={() => {
                      alert('Success! Delayed button click successfully captured.');
                      setDelayCompleted(false);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all animate-bounce cursor-pointer"
                  >
                    🚀 Delayed Action Active - Click Me!
                  </button>
                )}
              </div>
            </div>

            <button
              id="start-timer-btn"
              onClick={triggerDelayTimer}
              disabled={delayActive}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Start Delay Timer (3s)
            </button>
          </div>

          {/* Temporary/Disappearing Alert Banner */}
          <div id="disappearing-element-card" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
                <div>
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                    Intermediate
                  </span>
                  <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2">
                    2. Elusive Disappearing Element
                  </h3>
                </div>
                <Zap className="w-5 h-5 text-amber-500" />
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                Clicking the button displays an alert element that self-destructs after exactly 4 seconds. Your automation script must detect, read, and assert this message quickly.
              </p>

              <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col items-center justify-center min-h-[100px] mb-4">
                {isAlertVisible ? (
                  <div
                    id="temp-alert"
                    data-testid="temporary-toast"
                    className="w-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 p-3 rounded-lg text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Warning:</strong> Action will timeout shortly!</span>
                    </div>
                    <span className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded text-[10px]">
                      {alertSecondsLeft}s left
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 dark:text-stone-500 italic">
                    Alert currently inactive.
                  </span>
                )}
              </div>
            </div>

            <button
              id="trigger-alert-btn"
              onClick={triggerDisappearingAlert}
              disabled={isAlertVisible}
              className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Generate Disappearing Alert (4s)
            </button>
          </div>

        </div>

        {/* Challenge 3 & 4 Panel (Click Interception & Z-Index) */}
        <div className="space-y-6 flex flex-col">
          
          {/* Z-Index Overlap / Click Interceptor Block */}
          <div id="z-index-overlap-card" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 flex-1 flex flex-col justify-between relative overflow-hidden">
            
            {/* The Covered Overlay - Styled like a floating banner or dynamic prompt inside the card wrapper! */}
            {isOverlayOpen && (
              <div
                id="blocking-overlay"
                className="absolute inset-0 bg-stone-900/90 dark:bg-stone-950/95 backdrop-blur-xs z-40 p-6 flex flex-col items-center justify-center text-center animate-fade-in"
              >
                <div className="max-w-xs space-y-3">
                  <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
                  <h4 className="font-semibold text-white text-sm">Click Interceptor Overlay Active!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This dynamic panel obscures the target button below. Standard click events will strike this element first and fail. Dismiss this blocker before proceeding!
                  </p>
                  <button
                    id="close-overlay-btn"
                    data-testid="overlay-close"
                    onClick={() => setIsOverlayOpen(false)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Close Blocker Panel
                  </button>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
                <div>
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                    Advanced
                  </span>
                  <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2">
                    3. Z-Index Click Interception
                  </h3>
                </div>
                <Layers className="w-5 h-5 text-rose-500" />
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                Clicking "Overlay" covers the card canvas with a high z-index blocker. Test scripts must detect and dismiss the blocker first, or execute a forced click workaround.
              </p>

              {/* Dynamic Rotator Indicator Embedded Here to increase complexity */}
              <div className="mb-4 p-3 bg-stone-50/50 dark:bg-stone-950/10 border border-stone-200/30 dark:border-stone-900/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Dynamic State Poller</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-ping" />
                </div>
                <div
                  id="dynamic-text-indicator"
                  className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1"
                >
                  {statusText}
                </div>
              </div>

              {/* Targets Container */}
              <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-100 dark:border-stone-800 flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">Valid Clicks Registered:</span>
                  <strong id="click-counter-display" className="font-mono text-amber-600 dark:text-amber-400 text-sm">
                    {clickCount}
                  </strong>
                </div>

                <button
                  id="obscured-target-btn"
                  data-testid="target-btn"
                  onClick={handleTargetClick}
                  className="w-full bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors border border-stone-700 cursor-pointer"
                >
                  Target Action Button
                </button>
              </div>

              {/* Interception Logs */}
              <div className="mt-4">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">Click Logs:</span>
                <div
                  id="click-log-container"
                  className="bg-stone-950 rounded-xl p-3 border border-stone-800 font-mono text-[10px] text-stone-300 max-h-[90px] overflow-y-auto space-y-1"
                >
                  {clickLog.length > 0 ? (
                    clickLog.map((log, index) => (
                      <div
                        key={index}
                        className={log.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-rose-400'}
                      >
                        {log}
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No clicks logged yet.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                id="trigger-overlay-btn"
                onClick={() => setIsOverlayOpen(true)}
                disabled={isOverlayOpen}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40"
              >
                Trigger Blocker Overlay
              </button>
              <button
                id="reset-clicks-btn"
                onClick={() => {
                  setClickCount(0);
                  setClickLog([]);
                  setIsOverlayOpen(false);
                }}
                className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Hover-Activated Hidden Info Block */}
          <div id="hover-hidden-info-card" className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs p-6 flex-1 flex flex-col justify-between relative overflow-hidden mt-6">
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
                <div>
                  <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                    Advanced
                  </span>
                  <h3 className="font-semibold text-stone-900 dark:text-white text-base mt-2">
                    4. Hover-Activated Hidden Info
                  </h3>
                </div>
                <Fingerprint className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                Reveals the protected credential key only when you hover over the secure activation zone continuously for <strong>exactly 3 seconds</strong>. Removing your cursor will instantly reset progress.
              </p>

              {/* Activation Zone */}
              <div
                id="hover-activation-zone"
                data-testid="hover-activation-zone"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`border-2 border-dashed rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] select-none ${
                  hoverCompleted
                    ? 'border-emerald-500/50 bg-emerald-50/5 dark:bg-emerald-950/5'
                    : isHovering
                    ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 scale-[0.99]'
                    : 'border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-stone-700 bg-stone-50/30 dark:bg-stone-950/40'
                }`}
              >
                {!hoverCompleted ? (
                  <div className="space-y-3 pointer-events-none w-full">
                    <div className="mx-auto w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-amber-500 dark:text-amber-400">
                      {isHovering ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                        {isHovering ? 'Secure Scan in Progress...' : 'Hover here to begin scanning'}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Hold cursor inside for 3.0s
                      </p>
                    </div>

                    {/* Progress indicator */}
                    {isHovering && (
                      <div className="w-full max-w-xs mx-auto space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold font-mono text-amber-600 dark:text-amber-400">
                          <span>Scanning...</span>
                          <span>{hoverProgress}%</span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-950 h-1.5 rounded-full overflow-hidden border border-stone-100 dark:border-stone-900/40">
                          <div
                            id="hover-progress-bar"
                            data-testid="hover-progress-bar"
                            className="h-full bg-amber-600 transition-all duration-75 ease-out"
                            style={{ width: `${hoverProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in text-center w-full">
                    <div className="mx-auto w-10 h-10 rounded-full bg-emerald-50 dark:bg-stone-800 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                      <Unlock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                        Verification Successful!
                      </span>
                      <p className="text-[10px] text-stone-400 mt-0.5">Secure credential decrypted below</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Secret Area */}
              <div className="mt-4 min-h-[50px] flex items-center justify-center">
                {hoverCompleted ? (
                  <div
                    id="hidden-info-display"
                    data-testid="hidden-info-display"
                    className="w-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-3 rounded-xl text-center font-mono text-xs font-bold shadow-xs animate-fade-in flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>SECRET_KEY: SECURE-HOVER-PASS-7729</span>
                  </div>
                ) : (
                  <div className="text-center py-2 text-[11px] text-stone-400 italic flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Credential lock active. Perform hover scan to unlock.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                id="reset-hover-btn"
                data-testid="reset-hover-btn"
                onClick={handleResetHover}
                className="w-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Reset Challenge
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
