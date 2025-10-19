/**
 * Create Offer Tool
 * Create a new offer
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createOffer',
  description: `PRIMARY DEFAULT WORKFLOW - USE THIS FOR 95%+ OF ALL USE CASES

Create HTML/CSS/JavaScript offers for DOM modifications and visual changes.

THIS IS THE MAIN TOOL FOR ADOBE TARGET CONTENT DEVELOPMENT

CRITICAL: THIS TOOL CREATES OFFERS, NOT ACTIVITIES
When users mention activity types like "A/B test", "XT", "Experience Targeting", "Automated Personalization", etc., they are describing HOW the offer will be used, NOT what to create via API.

ALWAYS create an OFFER using this tool, regardless of activity type mentioned:
- "Create an A/B test banner" → Create OFFER with banner code
- "Create an XT experience" → Create OFFER with experience code
- "Create an Automated Personalization element" → Create OFFER with element code

The user will then use these offers in the Target UI to build their activity (A/B, XT, AP, etc.).

===============================================================================
COMPLETE END-TO-END WORKFLOW
===============================================================================

TYPICAL REQUEST: "Create an A/B test for a new hero banner on example.com/products"

STEP 1: PAGE EXTRACTION (When Needed)
Extract the page structure to understand what you're modifying:

When to extract:
- User wants to modify existing elements (change button color, update text, hide section)
- Need to understand page structure (find selectors, IDs, classes)
- Need to know where to insert new elements (parent hierarchy, insertion points)
- Unsure what elements exist on the page

When NOT to extract (skip to Step 2):
- Creating standalone element with no page context needed (simple banner, modal)
- User already provided selectors/IDs to target
- Very simple modifications that don't need page analysis

How to extract:
1. Call getPageStructureSnippets with extractionType: 'full-page'
2. Use Chrome DevTools MCP to navigate to the page
3. Execute the extraction script
4. Call extractPageStructure to save data and get summary
5. Use queryPageStructure to find specific elements as needed

Example:
- Get extraction script → Navigate to page → Execute script → Save structure
- Query for button: queryPageStructure(sessionId, 'find-by-id', 'cta-button')
- Get hierarchy: queryPageStructure(sessionId, 'get-element-hierarchy', 'hero-section')

STEP 2: GENERATE PREVIEW (REQUIRED - ALWAYS DO THIS BEFORE CREATING OFFERS)
Generate a preview of the modifications and show it to the user in Chrome BEFORE creating any offers:

CRITICAL: This step is MANDATORY and must ALWAYS be executed before calling createOffer.
The preview runs client-side in Chrome and does NOT require Adobe auth, so it will work even if your auth token is expired.

How to generate preview:
1. Generate the offer code following all Adobe Target rules (see ADOBE TARGET CODE GENERATION RULES section)
2. Call generatePreviewScript with:
   - modifications: The JavaScript code that makes the DOM changes
   - description: Clear description of what changes will be made
   - url: The URL where preview should be shown
3. Use Chrome DevTools MCP navigate_to to load the page (IMPORTANT: use timeout of 30000ms)
4. Use Chrome DevTools MCP evaluate_script to inject the preview script
5. The page will show a red "Target Preview Active" indicator
6. Ask the user: "Please review the changes in your browser. Does this look good?"
7. Wait for user approval before proceeding to Step 3

Example:
User: "Create a green CTA button"
LLM: Generates button code → Calls generatePreviewScript → Uses Chrome DevTools MCP to show preview → User sees green button in browser → User says "looks good" → LLM proceeds to Step 3

WHY THIS STEP IS REQUIRED:
- User can see and approve changes BEFORE any offers are created
- Preview works even if Adobe auth token is expired (client-side only)
- Prevents wasted API calls for offers that user might reject
- Better user experience - visual confirmation before commitment
- If auth fails in Step 3, user has still seen the preview

STEP 3: CREATE OFFERS (Only After Preview Approval)
Create one offer per variation/experience:

A/B Test Pattern (Most Common):
- Control Offer: Original/baseline version (often minimal or no changes)
- Variant Offer: New version being tested
- Total: 2 offers

Example A/B Test:
User: "Test a green button vs current blue button"
→ Control Offer: No changes (or minimal code to track existing button)
→ Variant Offer: Change button to green + tracking code
→ User creates A/B activity in Target UI with these 2 offers

Experience Targeting (XT) Pattern:
- One offer per audience segment
- Each offer tailored to specific audience
- Total: 1+ offers (depends on number of segments)

Example XT:
User: "Show different hero to mobile vs desktop users"
→ Mobile Offer: Mobile-optimized hero banner
→ Desktop Offer: Desktop-optimized hero banner
→ User creates XT activity in Target UI with these 2 offers + audience rules

Multivariate Test (MVT) Pattern:
- One offer per element per variation
- Test multiple elements simultaneously
- Total: Many offers (elements × variations)

Example MVT:
User: "Test headline (2 versions) and button (2 colors)"
→ Headline A Offer, Headline B Offer
→ Button Green Offer, Button Red Offer
→ Total: 4 offers
→ User creates MVT activity in Target UI testing all combinations

IMPORTANT OFFER CREATION RULES:
1. Create separate offers for each variation (don't combine in one offer)
2. Each offer should be self-contained and work independently
3. Control offer can be empty/minimal if testing against current page
4. Always include tracking code for conversion elements
5. Name offers clearly: "[Test Name] - [Variation Name]" (e.g., "Hero Test - Variant A")

STEP 4: PROVIDE OFFER IDs TO USER (Required)
After creating offers, tell the user:

"I've created [N] offers for your [activity type]:

OFFER IDs:
- [Offer Name]: ID [12345]
- [Offer Name]: ID [67890]

NEXT STEPS - Create Activity in Adobe Target UI:
1. Go to Adobe Target → Activities → Create Activity → [A/B Test | Experience Targeting | etc.]
2. Choose Form-Based Experience Composer
3. Set location to: target-global-mbox (or your preferred mbox)
4. For Experience A:
   - Click 'Change Content' → HTML Offer
   - Search for offer ID: [12345]
   - Select the offer
5. Click 'Add Experience' for Experience B (repeat for each variation)
   - Select offer ID: [67890]
6. Configure traffic allocation (e.g., 50/50 split for A/B test)
7. Set up success metrics (conversions, engagement, revenue)
8. Review audience targeting (if needed for XT)
9. Name your activity and save

BENEFITS:
- Full control in Target UI
- Can edit offers anytime
- Can edit activity settings
- QA mode works normally
- Reporting and analytics fully functional"

CONTROL VS VARIANT GUIDANCE:

What is a Control?
- The baseline/original experience (what users see now)
- Used to compare against new variations
- Can be "no changes" or the existing page as-is

What is a Variant?
- The new experience being tested
- Contains your modifications/improvements
- What you're testing to see if it performs better than control

How many offers to create:

A/B Test (2 offers):
→ Control: Existing experience (minimal code or tracking only)
→ Variant A: New experience with changes

A/B/n Test (3+ offers):
→ Control: Existing experience
→ Variant A: First alternative
→ Variant B: Second alternative
→ Variant C: Third alternative (etc.)

Experience Targeting (1+ offers):
→ One offer per audience segment
→ No "control" concept - each audience gets tailored experience

Example conversation:
User: "Create an A/B test for a new banner"
LLM: "I'll create 2 offers for your A/B test:
1. Control - keeps existing page as-is (no banner)
2. Variant - adds your new banner
Should I proceed?"

User: "Test 3 different button colors"
LLM: "I'll create 4 offers for your A/B/n test:
1. Control - current button (blue)
2. Variant A - green button
3. Variant B - red button
4. Variant C - purple button
Should I proceed?"

WHEN TO USE THIS TOOL (HTML OFFERS):
- User asks to create/modify page elements (carousel, button, banner, modal, form, etc.)
- User mentions ANY activity type (A/B, XT, AP) - just create the offer
- Traditional A/B tests with visual changes
- Experience Targeting (XT) experiences
- DOM modifications (change text, colors, layout, etc.)
- Adding new page elements
- Most standard Target use cases
- When user doesn't specify "JSON" or "SPA"

WHEN NOT TO USE (Use createJsonOffer instead):
- User explicitly asks for "JSON offer" or "JSON content"
- User mentions "SPA", "React", "Vue", "Angular", "headless", "API-driven"
- User wants structured data without DOM changes
- User is building a single-page application that consumes JSON

IF UNCLEAR WHICH TO USE:
Ask the user: "Are you working with a single-page application (SPA) that consumes JSON data, or do you want to modify the page's HTML/DOM directly?"
- If "SPA/JSON": Use createJsonOffer
- If "HTML/DOM": Use this tool (createOffer)
- Default to this tool (HTML) if user is still unclear

WHY USE THIS TOOL AS DEFAULT:
- Offers created via API CAN be fully edited in Adobe Target UI
- User maintains full control and flexibility in Target UI
- User can build/modify activities in Target with Visual Experience Composer
- QA mode and previews work normally
- No limitations or restrictions

DO NOT create activities programmatically unless:
- User explicitly requests bulk creation (10+ activities)
- User explicitly asks for programmatic activity creation after being warned about UI limitations

For 99% of use cases: CREATE OFFERS ONLY, let user build activity in Target UI.

===============================================================================
COMPLETE A/B TEST WORKFLOW (USE THIS APPROACH FOR ALL TARGET CONTENT CREATION & DEVELOPMENT)
===============================================================================

When a user asks to create an A/B test, experience, or personalization:

TEMPLATE SEARCH (Do This First):
Before generating code from scratch, search for existing templates that match the user's request:

1. SEARCH FOR MATCHING TEMPLATES:
   - Use MCP Resources to access templates (URIs like template://html/carousel)
   - Look for templates matching user's request by:
     * Template name (e.g., "carousel" for "create a carousel")
     * Keywords and descriptions
   - Common template matches:
     * "carousel", "slider", "gallery" → template://html/carousel
     * "hero", "banner" → template://html/hero-banner
     * "button", "cta" → template://html/cta-button
     * "modal", "popup", "overlay" → template://html/modal
     * "sticky", "announcement", "notification" → template://html/sticky-header
     * "countdown", "timer", "urgency" → template://html/countdown-timer

2. IF TEMPLATE FOUND:
   a) Read the template using MCP Resource (e.g., template://html/carousel)
   b) Parse the template JSON to get name, description, content, and variables
   c) Show template to user: "I found a '{name}' template: {description}. Would you like to use it as a starting point, or would you prefer I generate custom code?"
   d) If user chooses template:
      - Ask user for required variable values (marked as required: true in template)
      - Ask about optional variables (show defaults from template)
      - Replace all {{VARIABLE}} placeholders in content with user's values
      - Show the populated code to user
      - Ask: "Does this look good? Should I preview this in Chrome?"
      - If yes: Continue to STEP 2 (GENERATE PREVIEW), then STEP 3A.6 (CREATE OFFER) with the populated template code
      - If user wants changes: Modify the code and ask again
   e) If user prefers custom code:
      - Continue to STEP 1 (PAGE EXTRACTION) below

3. IF NO TEMPLATE FOUND:
   - Continue to STEP 1 (PAGE EXTRACTION) below

IMPORTANT NOTES ABOUT TEMPLATES:
- Templates already follow all Adobe Target rules (ES5, IIFE, responsive, defensive coding, no emojis)
- Templates are tested and working - use them when available to save time
- You can modify template code after populating variables if user requests changes
- Templates are located in src/templates/html/
- Each template has a variables array defining what needs to be replaced

STEP 1: ASK CLARIFYING QUESTIONS
Before generating any code, ask the user:
a) "Do you have any links or image assets that need to be used?"
   - If yes: Use their exact URLs
   - If no: Add placeholders and document them.
b) "How many variations do you want to test?" (if not specified)
c) "What page element are you targeting?" (if not clear from the initial request)
d) "Would you like me to create the offers in Target, or just show you the code?"
   - If "create offers": Follow STEP 2 (GENERATE PREVIEW), then STEP 3A
   - If "just show code": Follow STEP 2 (GENERATE PREVIEW), then STEP 3B

STEP 3A: GENERATE AND CREATE OFFERS (Use This Tool)
For each variation:

3A.1 IDENTIFY CONVERSION ELEMENTS
- Determine if this variation creates or modifies conversion elements (buttons, CTAs, links, forms)
- If YES: Continue to Step 3A.2
- If NO (only visual changes): Skip to Step 3A.4

3A.2 ASK ABOUT TRACKING (REQUIRED FOR NEW ELEMENTS)
Before generating code:
a) TAG MANAGER SELECTION:
   - If full-page extraction was done earlier (getPageStructureSnippets with extractionType: 'full-page'), check context for tagManagers.summary.recommendedForTracking
   - If tag manager was auto-detected, use that and inform user: "I detected {name} on the page, I'll use that for tracking"
   - If NOT detected or no full-page extraction in context:
     * Read src/config/tag-managers.json to discover available tag managers
     * Ask the user: "Which tag manager are you using?" (default: adobeLaunch)
     * Present the available options from the config file
b) Ask the user: "When should the conversion event fire?" (default: always)
   Present these options clearly:
   - **Every time (no limit)** - DEFAULT - Track every interaction
   - Once per session - Prevents duplicate tracking (use for conversions if needed)
   - Once per page - Track once per page load
   - Once ever - Track once, stored permanently
   - Throttle - Limit frequency (ask for interval)
   - Debounce - Wait for user to stop interacting (ask for delay)

3A.3 GENERATE TRACKING CODE
- Call generateDataLayerEvent tool with:
  * selector: The CSS selector for the conversion element (e.g., ".at-cta-button", "#at-signup-btn")
  * activity_name: The activity name (ask user if not provided)
  * experience_name: The variation name (e.g., "Control", "Variant A", "Green Button")
  * tag_manager: From user's answer in 3A.2a
  * firing_condition: From user's answer in 3A.2b
- Save the returned tracking code

3A.4 GENERATE COMPLETE OFFER CODE
- Generate optimized HTML/CSS/JS code following all Adobe Target rules below
- NEVER include emojis in the generated code or content (text, comments, HTML, etc.)
- If conversion element exists (from 3A.1):
  * Include the DOM modifications (create/modify button, styling, etc.)
  * Include the tracking code from 3A.3 AFTER the DOM modifications
  * Wrap everything in an IIFE: (function() { /* code */ })()
- Ensure all code is ES5-compatible (no backticks, arrow functions, const/let)

3A.5 SHOW CODE TO USER
- Display the complete offer code (including tracking if applicable)
- Explain what the code does
- If tracking was included, note: "This includes conversion tracking for [tag manager] that fires [firing condition]"

3A.6 CREATE OFFER
- Ask: "Should I create this offer in Adobe Target?"
- If yes: Create offer via createOffer tool and save the returned offer ID
- If no: Just provide the code for manual use

Example:
Control Offer ID: 2299231
Variant Offer ID: 2299232

STEP 3B: GENERATE CODE ONLY (No Tool Call)
For each variation:

3B.1 IDENTIFY CONVERSION ELEMENTS
- Determine if this variation creates or modifies conversion elements (buttons, CTAs, links, forms)
- If YES: Continue to Step 3B.2
- IF NO (only visual changes): Skip to Step 3B.4

3B.2 ASK ABOUT TRACKING (REQUIRED FOR NEW ELEMENTS)
Before generating code:
a) TAG MANAGER SELECTION (same as STEP 3A.2a):
   - If full-page extraction was done earlier, check context for tagManagers.summary.recommendedForTracking
   - If tag manager was auto-detected, use that and inform user: "I detected {name} on the page, I'll use that for tracking"
   - If NOT detected or no full-page extraction in context:
     * Read src/config/tag-managers.json to discover available tag managers
     * Ask the user: "Which tag manager are you using?" (default: adobeLaunch)
     * Present the available options from the config file
b) Ask the user: "When should the conversion event fire?" (default: always)
   Present the same options as STEP 3A.2b

3B.3 GENERATE TRACKING CODE
- Call generateDataLayerEvent tool with appropriate parameters
- Save the returned tracking code

3B.4 GENERATE COMPLETE CODE
- Generate optimized HTML/CSS/JS code following all Adobe Target rules below
- If conversion element exists: Include tracking code AFTER DOM modifications
- Wrap in IIFE

3B.5 SHOW CODE TO USER
- Show the code with explanation
- If tracking included, note: "This includes conversion tracking for [tag manager] that fires [firing condition]"
- Provide manual instructions: "You can copy this code and paste it into Target UI when creating your offer manually"

STEP 4: PROVIDE NEXT STEPS TO USER
After creating offers, provide these EXACT instructions:

"I've created {N} offers for your A/B test. Here's how to set up the activity:

OFFER IDs CREATED:
- Control: {offer_name} (ID: {offer_id})
- Variant: {offer_name} (ID: {offer_id})

NEXT STEPS IN ADOBE TARGET UI:
1. Go to Adobe Target → Activities → Create Activity → A/B Test
2. Choose Form-Based Experience Composer
3. Set location to: {mbox_name} (default: target-global-mbox)
4. For Experience A (Control):
   - Click 'Change Content' → HTML Offer
   - Search for offer ID: {control_offer_id}
   - Select the offer
5. Click 'Add Experience' to create Experience B (Variant)
   - Click 'Change Content' → HTML Offer
   - Search for offer ID: {variant_offer_id}
   - Select the offer
6. Set traffic allocation (default: 50/50 split)
7. Configure goal/metric (default: Page Views - Engagement)
8. Review, name your activity, and save

BENEFITS OF THIS APPROACH:
- You can edit the activity in Target UI
- You can edit the offers in Target UI
- Full flexibility with Visual Experience Composer
- QA mode and previews work normally"

If only code was generated (no offers created), provide these instructions:

"I've generated {N} code variations for your A/B test:

VARIATION {N}: {variation_name}
[Show the HTML/CSS/JS code here]

TO USE THIS CODE MANUALLY:
1. Go to Adobe Target → Activities → Create Activity → A/B Test
2. Choose Form-Based Experience Composer
3. For each experience:
   - Click 'Change Content' → Create HTML Offer
   - Paste the code above
   - Name the offer
4. Set traffic allocation (default: 50/50 split)
5. Configure goal/metric (default: Page Views)
6. Save and activate

TIP: If you want me to create these as offers in Target for you (so you can reuse them), just let me know and I'll call the createOffer tool."

===============================================================================

HTML OFFER STRUCTURE (CRITICAL - MUST FOLLOW):
When creating HTML offers, the content parameter MUST be properly structured:

REQUIRED STRUCTURE:
- All JavaScript code MUST be wrapped in <script> tags
- CSS CANNOT be added via <style> tags directly - it must be injected via JavaScript
- HTML can be included directly (no wrapper needed)

CSS HANDLING (CRITICAL):
Adobe Target HTML offers do NOT support standalone <style> tags. You have TWO options for styling:

OPTION 1: Inject <style> tag into <head> via JavaScript (RECOMMENDED for multiple styles)
<script>
(function() {
  var style = document.createElement('style');
  style.textContent = '' +
    '.at-hero-banner {' +
    '  background: blue;' +
    '  padding: 20px;' +
    '}' +
    '@media (max-width: 768px) {' +
    '  .at-hero-banner { padding: 10px; }' +
    '}';
  document.head.appendChild(style);
})();
</script>

OPTION 2: Apply inline styles directly via JavaScript (RECOMMENDED for few styles)
<script>
(function() {
  var element = document.querySelector('.hero');
  if (element) {
    element.style.background = 'blue';
    element.style.padding = '20px';
  }
})();
</script>

WRONG - Do NOT use standalone <style> tags:
<style>
  .at-hero-banner { background: blue; }  /* WRONG - Target doesn't support this */
</style>

CORRECT - Complete offer example with injected CSS:
<script>
(function() {
  // Inject CSS into head
  var style = document.createElement('style');
  style.textContent = '.at-hero-banner { background: blue; padding: 20px; }';
  document.head.appendChild(style);

  // Modify DOM
  var button = document.querySelector('.at-cta');
  if (button) {
    button.style.backgroundColor = 'green';
  }
})();
</script>

CORRECT - Offer with HTML and JavaScript:
<div class="at-promo-banner">
  <h2>Special Offer!</h2>
  <button id="at-cta-btn">Shop Now</button>
</div>

<script>
(function() {
  // Style the new elements
  var banner = document.querySelector('.at-promo-banner');
  if (banner) {
    banner.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    banner.style.padding = '40px';
    banner.style.textAlign = 'center';
  }
})();
</script>

===============================================================================

ADOBE TARGET CODE GENERATION RULES (CRITICAL - MUST FOLLOW):
When generating code for the content parameter, you MUST follow these rules:

CONTENT RULES:
- NEVER use emojis in generated code, HTML content, text, comments, or anywhere in the offer
- Keep all text, button labels, and content professional and emoji-free
- Use plain text only for all user-facing content

DOM & Element Handling:
- Do NOT use DOM ready functions (no $(document).ready, DOMContentLoaded, etc.) unless explicitly asked
- Use specific selectors - NEVER use broad selectors like 'div', 'span', 'button' alone. Always use classes, IDs, or attribute selectors
- Modify existing elements - Change text/styles/attributes rather than replacing entire DOM structures
- Use hide/show patterns - Toggle visibility rather than remove/add elements
- Insert content through Target - Do not directly modify HTML structure with new divs

Code Quality & Compatibility:
- ES5 ONLY - Adobe Target cannot accept ES6 features:
  * NO backticks or template literals (use string concatenation with +)
  * NO arrow functions (use function() {} syntax)
  * NO const/let (use var only)
  * NO destructuring, spread operators, or other ES6+ features

PREVENTING VARIABLE COLLISIONS (CRITICAL):
- ALWAYS wrap code in IIFE to avoid polluting global scope: (function() { ... })()
- Use local 'var' variables inside IIFE (they won't conflict with page variables)
- IF you absolutely need a global variable (rare - only for cross-offer state):
  * Use window.at_variableName = value; (explicit global with 'at_' prefix)
  * Check if it exists first: if (!window.at_myVar) { window.at_myVar = ...; }
  * NEVER use bare 'var' at top level (creates implicit globals that can overwrite page vars)

Examples:
CORRECT - Local variables in IIFE (recommended):
<script>
(function() {
  var button = document.querySelector('.cta');  // Local var, won't conflict
  var count = 0;  // Local var, safe
  if (button) {
    button.textContent = 'Click Me';
  }
})();
</script>

CORRECT - Explicit global when needed (rare):
<script>
(function() {
  // Only if you need to share state across multiple offers
  if (!window.at_clickCount) {
    window.at_clickCount = 0;
  }
  window.at_clickCount = window.at_clickCount + 1;
})();
</script>

WRONG - Bare var at top level (can overwrite page variables):
<script>
var button = document.querySelector('.cta');  // BAD: Creates implicit global
var count = 0;  // BAD: Could overwrite existing page variable
</script>

- No external dependencies - Don't load jQuery, libraries, or external scripts
- Vanilla JavaScript only - Keep it simple and cross-browser compatible
- Defensive coding - Always check if element exists: if (element) { ... }
- Idempotent code - Script might run multiple times; ensure it handles that gracefully

Styling:
- Inline styles for specificity - Use element.style.property = value to override existing styles
- Inject CSS in <style> tags - If adding CSS rules, inject a <style> block in <head>
- !important sparingly - Only use when absolutely necessary for specificity
- Prefix new classes with "at-" - ALL new classes you create must start with "at-" (e.g., "at-hero-banner", "at-cta-button"). This identifies Target-inserted elements.
- Never style existing page classes - Do NOT write CSS rules targeting existing page classes (too broad, causes conflicts)
- Target existing elements by ID - Use IDs or specific attribute selectors to target existing elements, NOT broad class names
- Example: Use '#main-cta' or '[data-testid="hero-button"]', NOT '.button' or '.cta'

Responsive Design:
- ALWAYS write responsive code that works on both mobile and desktop
- Use media queries when adding CSS via <style> tags: @media (max-width: 768px) { ... }
- Test viewport-specific styles: Mobile (375px-768px), Desktop (1024px+)
- Avoid fixed pixel widths - Use percentages or max-width instead
- Consider mobile-first: Default styles for mobile, enhance for desktop
- Hide/show elements per viewport if needed: display: none on mobile, display: block on desktop
- Font sizes should scale appropriately: Smaller on mobile, larger on desktop
- Button/CTA sizes should be touch-friendly on mobile (min 44x44px tap target)

Performance & Safety:
- Minimize DOM queries - Cache element references: var button = document.querySelector('.cta')
- NO polling/setInterval/setTimeout - NEVER use timers for waiting. Bad for browser performance.
- Target fires after DOM ready - Elements should already exist when code runs
- Defensive coding - Always check if element exists: if (element) { modify it }
- If element doesn't exist, fail gracefully (don't throw errors)
- No document.write() - Breaks page after load
- Preserve existing functionality - Don't remove event listeners or break page behavior

Documentation:
- Add inline comments - Explain what each modification does (helps editing in Target UI later)
- Include selector explanations - Comment why specific selector was chosen

Conversion Tracking (CRITICAL - FOLLOW STEP 2A.2 AND 2A.3):
- ALWAYS add dataLayer tracking to conversion elements (buttons, CTAs, forms, etc.)
- BEFORE generating the offer code:
  1. Ask user about tag manager preference if not detected automatically (Step 3A.2a or 3B.2a)
  2. Ask user about firing condition (Step 3A.2b or 3B.2b)
  3. Call generateDataLayerEvent tool to get tracking code (Step 3A.3 or 3B.3)
  4. Include the tracking code in the offer AFTER DOM modifications (Step 3A.4 or 3B.4)
- Use the generateDataLayerEvent tool - it generates ES5-compatible code with proper firing conditions
- Place tracking code AFTER DOM modifications in the offer
- Attach click/submit event listeners that fire: dataLayer.push({event: "target_conversion", at_activity: "...", at_experience: "..."})
- Default event structure should be be: event="target_conversion", at_activity="...", at_experience="..." unless specified differently by the user
- NO template literals - use string concatenation only for ES5 compatibility
- Example workflow:
  1. Generate button modification code
  2. Call generateDataLayerEvent(selector: '.at-cta-button', activity_name: 'Hero Test', experience_name: 'Variant A', tag_manager: 'adobeLaunch', firing_condition: 'always')
  3. Include returned tracking code in offer after button code
  4. Show complete offer code to user`,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Offer name',
      },
      content: {
        type: 'string',
        description: 'Offer content (HTML/CSS/JavaScript). Wrap JavaScript in <script> tags. CSS must be injected via JavaScript, NOT standalone <style> tags.',
      },
      workspace: {
        type: 'string',
        description: 'Workspace ID (optional). If not provided, uses the default workspace from config (TARGET_WORKSPACE_ID) or the account default workspace.',
      },
    },
    required: ['name', 'content'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  const payload = {
    name: args.name,
    content: args.content,
  };

  // Add workspace if provided or use from config
  if (args.workspace) {
    payload.workspace = args.workspace;
  } else if (config.workspaceId) {
    payload.workspace = config.workspaceId;
  }

  return await makeTargetRequest(config, 'POST', '/target/offers/content', payload, 'v2');
}
