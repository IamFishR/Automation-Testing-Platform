import React, { useState } from 'react';
import { Terminal, Copy, Check, ShieldAlert, Award } from 'lucide-react';
import { AutomationFramework } from '../types';

export default function AutomationGuides() {
  const [activeFramework, setActiveFramework] = useState<AutomationFramework>('playwright');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const snippets = {
    playwright: {
      dynamicWait: `// 1. Wait for a delayed button to become visible and click it
await page.goto('APP_URL');
await page.click('button#start-timer-btn');

// Playwright auto-waits up to 30s, but you can explicitly wait for selectors
const delayedBtn = page.locator('#delayed-success-btn');
await delayedBtn.waitFor({ state: 'visible', timeout: 5000 });
await delayedBtn.click();`,

      shadowDom: `// 2. Playwright traverses OPEN Shadow DOMs automatically!
await page.goto('APP_URL');

// Standard css locator pierces open shadow root by default:
await page.fill('input#open-shadow-input', 'Testing Open Shadow');
await page.click('button#open-shadow-submit');

// 3. Traversing CLOSED Shadow DOMs (Advanced)
// Closed shadow roots are hidden from standard querySelector.
// We must access them via page.evaluate or JSPath:
const closedInputVal = await page.evaluate(() => {
  const host = document.querySelector('closed-shadow-element');
  if (!host) return null;
  // Accessible in internal code if we spy on attachShadow or use our playground API:
  const input = host.shadowRoot?.querySelector('input');
  if (input) {
    input.value = 'Hacked Closed Shadow';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return input.value;
  }
  return null;
});`,

      iframe: `// 4. Accessing elements inside nested IFrames
await page.goto('APP_URL');

// Locate the frame using frameLocator
const testFrame = page.frameLocator('iframe#testing-iframe');
const frameInput = testFrame.locator('input#frame-user-input');

await frameInput.fill('Playwright Inside Frame');
await testFrame.locator('button#frame-submit-btn').click();

// Validate action result in iframe
await expect(testFrame.locator('#frame-result-message')).toHaveText('Success!');`,

      zindex: `// 5. Handling Click Interceptions (Z-Index Overlays)
await page.goto('APP_URL');

// Triggering the overlay
await page.click('#trigger-overlay-btn');

// Attempting to click the obscured button directly will fail in Playwright
// as it checks for actionability (visible, not covered).
// To bypass or handle:
// Option A: Dismiss the overlay first (Recommended)
await page.click('#close-overlay-btn');
await page.click('#obscured-target-btn');

// Option B: Force click bypassing safety checks (Use with caution)
await page.click('#obscured-target-btn', { force: true });`
    },
    selenium: {
      dynamicWait: `# Python Selenium Recipe
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get("APP_URL")

# Trigger dynamic action
driver.find_element(By.ID, "start-timer-btn").click()

# Explicit wait for the delayed element (max 5 seconds)
wait = WebDriverWait(driver, 5)
delayed_btn = wait.until(
    EC.visibility_of_element_located((By.ID, "delayed-success-btn"))
)
delayed_btn.click()`,

      shadowDom: `# Traversing Shadow DOMs in Selenium (Python)
driver.get("APP_URL")

# 1. Open Shadow DOM (Requires execute_script or shadow_root API in modern Selenium)
shadow_host = driver.find_element(By.TAG_NAME, "open-shadow-element")
shadow_root = shadow_host.shadow_root # Supported in modern Selenium 4+
shadow_input = shadow_root.find_element(By.CSS_SELECTOR, "input#open-shadow-input")
shadow_input.send_keys("Selenium Traversing Open Shadow")

# 2. Closed Shadow DOM (Injecting JS to bypass)
# Closed shadow roots cannot be retrieved via driver.shadow_root.
# In our playground, we support a developer testing backdoor:
js_query = """
const host = document.querySelector('closed-shadow-element');
const input = host._closedRoot.querySelector('input');
input.value = 'Selenium Traversed Closed';
input.dispatchEvent(new Event('input', { bubbles: true }));
return input.value;
"""
val = driver.execute_script(js_query)`,

      iframe: `# Switching to IFrames and back
driver.get("APP_URL")

# Locate iframe and switch focus to it
iframe_el = driver.find_element(By.ID, "testing-iframe")
driver.switch_to.frame(iframe_el)

# Now interact with iframe content
iframe_input = driver.find_element(By.ID, "frame-user-input")
iframe_input.send_keys("Selenium inside Frame")
driver.find_element(By.ID, "frame-submit-btn").click()

# Switch back to the main document context
driver.switch_to.default_content()`,

      zindex: `# Dealing with intercepted clicks due to overlapping z-indexes
driver.get("APP_URL")

# Try to click the target button directly while overlay is open
# Will raise ElementClickInterceptedException.
# Proper way: Dismiss overlay first
driver.find_element(By.ID, "close-overlay-btn").click()
driver.find_element(By.ID, "obscured-target-btn").click()

# Alternative: Force click using Javascript execution
target = driver.find_element(By.ID, "obscured-target-btn")
driver.execute_script("arguments[0].click();", target)`
    },
    cypress: {
      dynamicWait: `// Cypress automatic retries and explicit timeouts
cy.visit('APP_URL');
cy.get('#start-timer-btn').click();

// Specify high timeout for slow dynamic loading element
cy.get('#delayed-success-btn', { timeout: 5000 })
  .should('be.visible')
  .click();`,

      shadowDom: `// Traversing Shadow DOM in Cypress
cy.visit('APP_URL');

// 1. Pierce Open Shadow Root using 'includeShadowDom' config or option
cy.get('open-shadow-element')
  .shadow()
  .find('input#open-shadow-input')
  .type('Cypress pierces open shadow!');

// 2. Closed Shadow Root
// Cypress shadow() command fails on closed shadow roots.
// Can be resolved by accessing our testing backdoors via window evaluate:
cy.get('closed-shadow-element').then(($el) => {
  const host = $el[0];
  const input = host._closedRoot.querySelector('input');
  input.value = 'Cypress Closed Resolved';
  input.dispatchEvent(new Event('input', { bubbles: true }));
});`,

      iframe: `// Traversing IFrames in Cypress
cy.visit('APP_URL');

// Cypress requires manual wrapping of iframe elements
cy.get('iframe#testing-iframe')
  .its('0.contentDocument.body')
  .should('not.be.empty')
  .then(cy.wrap)
  .as('iframeBody');

cy.get('@iframeBody')
  .find('input#frame-user-input')
  .type('Cypress frame input');

cy.get('@iframeBody')
  .find('button#frame-submit-btn')
  .click();`,

      zindex: `// Handling Z-index overlays in Cypress
cy.visit('APP_URL');

// Triggering overlay
cy.get('#trigger-overlay-btn').click();

// Standard click would throw an error that the element is covered.
// Option A: Close overlay first
cy.get('#close-overlay-btn').click();
cy.get('#obscured-target-btn').click();

// Option B: Force click bypassing visibility checks
cy.get('#obscured-target-btn').click({ force: true });`
    }
  };

  const codeBlocks = [
    {
      id: 'dynamicWait',
      title: 'Delayed & Async Elements',
      description: 'How to handle elements that render with server-side latency or client-side delays.',
      code: snippets[activeFramework].dynamicWait,
    },
    {
      id: 'shadowDom',
      title: 'Shadow DOM Piercing (Open & Closed)',
      description: 'Accessing and entering keys into components encapsulated inside open or closed Shadow roots.',
      code: snippets[activeFramework].shadowDom,
    },
    {
      id: 'iframe',
      title: 'IFrame & Context Switching',
      description: 'Switching active browsing contexts to interact with elements nested inside IFrames.',
      code: snippets[activeFramework].iframe,
    },
    {
      id: 'zindex',
      title: 'Click Interception & Z-Index Overlays',
      description: 'Resolving visibility blocks, dynamic modals, or click interceptions by overlapping elements.',
      code: snippets[activeFramework].zindex,
    }
  ];

  return (
    <div id="guides-root" className="space-y-8">
      {/* Header Panel */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold font-display text-stone-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-amber-500" />
              Automation Test Recipes
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Select your framework to get code recipes for successfully passing every challenge in this playground.
            </p>
          </div>

          {/* Framework Toggle */}
          <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl w-fit self-start md:self-center border border-stone-200/50 dark:border-stone-700/50">
            {(['playwright', 'selenium', 'cypress'] as AutomationFramework[]).map((fw) => (
              <button
                key={fw}
                id={`fw-toggle-${fw}`}
                onClick={() => setActiveFramework(fw)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                  activeFramework === fw
                    ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Solutions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {codeBlocks.map((block) => (
          <div
            key={block.id}
            id={`guide-card-${block.id}`}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex justify-between items-start gap-4">
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-white flex items-center gap-2 text-base">
                  <Award className="w-4 h-4 text-amber-500" />
                  {block.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {block.description}
                </p>
              </div>
              <button
                id={`copy-btn-${block.id}`}
                onClick={() => copyToClipboard(block.id, block.code)}
                className="p-2 text-stone-400 hover:text-amber-500 dark:text-stone-500 dark:hover:text-amber-400 bg-stone-50 dark:bg-stone-800 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-600 shrink-0"
                title="Copy Code Snippet"
              >
                {copiedId === block.id ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Code Editor Body */}
            <div className="bg-stone-950 p-4 font-mono text-xs overflow-x-auto flex-1 text-stone-300 select-text leading-relaxed">
              <pre className="whitespace-pre">
                <code>{block.code}</code>
              </pre>
            </div>

            {/* Quick automation tip */}
            <div className="px-5 py-3 bg-stone-50/50 dark:bg-stone-950/20 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>
                Tip: Copy this code directly to your local test suite to see assertions validate live!
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
