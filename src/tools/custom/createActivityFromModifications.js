/**
 * Create Activity from Modifications Tool
 * Create a Target XT activity from approved modifications
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createActivityFromModifications',
  description: `CRITICAL WARNING: DO NOT USE THIS TOOL FOR NORMAL WORKFLOWS

Activities created via this API are PERMANENTLY LOCKED - they CANNOT be edited in Adobe Target UI.

DEFAULT WORKFLOW (USE THIS 99% OF THE TIME):
1. Create offers using createOffer tool (HTML) or createJsonOffer tool (JSON)
2. Provide user with offer IDs
3. User manually builds XT activity in Target UI with full editing flexibility

DO NOT USE THIS TOOL UNLESS:
1. User is creating 10+ activities in bulk (programmatic bulk creation)
2. This is part of an automated CI/CD workflow
3. User has been EXPLICITLY WARNED that activities cannot be edited in Target UI
4. User has confirmed they understand the limitation and still want to proceed

MANDATORY STEPS BEFORE USING THIS TOOL:
You MUST complete ALL of these steps before calling this tool:
1. Ask user: "Are you creating 10+ activities in bulk?"
   - If NO: Stop. Tell user to use createOffer workflow instead
   - If YES: Continue to step 2
2. Warn user: "Activities created via API will be permanently locked and cannot be edited in Adobe Target UI. You will not be able to modify them later through the Target interface. Do you understand and want to proceed?"
   - If NO: Stop. Use createOffer workflow instead
   - If YES: Continue to step 3
3. Confirm: "To confirm: You understand the activity will be locked in Target UI and you still want to create it programmatically?"
   - If NO: Stop. Use createOffer workflow
   - If YES: Proceed with this tool

If user does NOT confirm all three steps, DO NOT use this tool. Use createOffer instead.

RECOMMENDED ALTERNATIVE (99% of use cases):
Use createOffer to create offers, then tell user:
"I've created the offers. Here are the offer IDs: [list IDs]
To create your XT activity:
1. Go to Adobe Target → Activities → Create Activity → Experience Targeting
2. Choose Form-Based Experience Composer
3. Add experiences and select these offer IDs
4. Configure audience targeting
This gives you full editing flexibility in the Target UI."

CRITICAL WORKFLOW REQUIREMENTS FOR LLM (IF YOU MUST USE THIS TOOL):
1. BEFORE generating code, ask user: "Do you have any links or image assets that need to be used in this experience?"
   - If user provides links/images: Use the exact URLs provided
   - If user says "no" or doesn't provide assets: Use placeholder links (e.g., "https://example.com/image.jpg" or "#" for links)
   - Document any placeholders clearly so user knows what to replace

2. Generate the modification code following ALL Adobe Target coding rules
   CRITICAL: NEVER include emojis in generated code, HTML, text, or comments

3. PREVIEW THE CODE FIRST - Use Chrome DevTools MCP to inject and test:
   - Use Chrome DevTools MCP to navigate to the target URL
   - Inject the generated JavaScript code into the live page (with optional preview indicator for visual confirmation)
   - User will see changes live in their Chrome browser
   - Ask: "Does this look correct? Should I create the activity?"
   - If user wants changes, modify code and preview again
   - ONLY proceed to create activity after user approves the preview

   IMPORTANT: The preview indicator is ONLY for preview - do NOT include it in the modifications parameter when creating the activity

   RESPONSIVE TESTING - Test the experience across viewports:
   - ALWAYS test experiences on both mobile and desktop viewports before creating activity
   - Use Chrome DevTools MCP resize_page tool to test different viewport sizes
   - Standard viewport sizes to test:
     * Mobile: 375x667 (iPhone SE) or 390x844 (iPhone 14)
     * Desktop: 1920x1080 or 1440x900
   - After injecting code, resize to mobile viewport and ask user to check
   - Then resize to desktop viewport and ask user to check
   - Ensure the experience works correctly on both viewports before proceeding
   - If experience has responsive issues, modify the code to fix them

   Example responsive testing flow:
   1. Navigate to URL
   2. Inject modification code
   3. Resize to 375x667 (mobile)
   4. Ask: "Check mobile view in Chrome. Does it look correct?"
   5. Resize to 1920x1080 (desktop)
   6. Ask: "Check desktop view in Chrome. Does it look correct?"
   7. Only proceed if both viewports are approved

4. After user approves preview, create the activity:
   - Show the user a summary of what will be created
   - List any placeholder assets that need to be replaced
   - Call this tool to create the activity
   - NOTE: Audience targeting will be handled by the user manually in Target UI

5. NEVER create an activity without previewing it first
6. NEVER create an activity based on assumptions - always confirm via preview

Example workflow:
LLM: "Do you have any links or images for this experience?"
User: "No"
LLM: [Generates clean, responsive modification code with media queries]
LLM: "Let me preview this for you..."
LLM: [Uses Chrome DevTools MCP to navigate and inject code - adds preview indicator]
LLM: [Resizes viewport to 375x667 mobile]
LLM: "Check your Chrome browser (mobile view). The button is now green with text 'Get Started Now'. Does this look correct?"
User: "Yes"
LLM: [Resizes viewport to 1920x1080 desktop]
LLM: "Now check desktop view. Does it look correct?"
User: "Yes, looks good"
LLM: [Calls this tool with the clean modification code - NO preview indicator]

ADOBE TARGET CODE GENERATION RULES:
You MUST follow these rules when generating JavaScript code for the modifications parameter:

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
- No external dependencies - Don't load jQuery, libraries, or external scripts
- Vanilla JavaScript only - Keep it simple and cross-browser compatible
- Defensive coding - Always check if element exists: if (element) { ... }
- Avoid global variable pollution - Wrap code in IIFE: (function() { ... })()
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

Conversion Tracking:
- ALWAYS add dataLayer tracking to conversion elements (buttons, CTAs, forms, etc.)
- Add datalayer tracking to any negative user actions too like closing a popup or offer
- Use the generateDataLayerEvent tool to generate tracking code
- Ask the User for the name of the test to populate at_activity
- Attach click/submit event listeners that fire: dataLayer.push({event: "target_conversion", at_activity: "...", at_experience: "..."})
- Event structure must be: event="target_conversion", at_activity="...", at_experience="..."
- NO template literals - use string concatenation only for ES5 compatibility
- Example: element.addEventListener('click', function() { dataLayer.push({event: 'target_conversion', at_activity: 'Hero Test', at_experience: 'Variant A'}); });`,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Activity name',
      },
      url: {
        type: 'string',
        description: 'URL where the activity should run',
      },
      modifications: {
        type: 'string',
        description: 'JavaScript code for the modifications',
      },
      priority: {
        type: 'number',
        description: 'Activity priority (0-999), defaults to 5',
      },
      audienceIds: {
        type: 'array',
        items: {
          type: 'number',
        },
        description: 'Optional: Array of audience IDs to target. If not provided, activity targets All Visitors. Get audience IDs using the listAudiences tool.',
      },
    },
    required: ['name', 'url', 'modifications'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  // Validate modifications for common issues
  const validationWarnings = [];
  const modifications = args.modifications;
  // Check for overly broad selectors
  const broadSelectors = ['div', 'span', 'button', 'a', 'p', 'h1', 'h2', 'h3'];
  for (const selector of broadSelectors) {
    if (modifications.includes(`querySelector('${selector}')`) || modifications.includes(`querySelector("${selector}")`)) {
      validationWarnings.push(`WARNING: Very broad selector detected: '${selector}' - this may affect multiple elements`);
    }
  }

  // Check for querySelectorAll without iteration
  if (modifications.includes('querySelectorAll') && !modifications.includes('forEach') && !modifications.includes('[0]')) {
    validationWarnings.push('WARNING: querySelectorAll used without iteration - this may not modify elements as expected');
  }

  // If warnings exist, add them to the result
  if (validationWarnings.length > 0) {
    console.error('[createActivityFromModifications] Validation warnings detected:', validationWarnings);
  }

  // First, create an offer with the modifications
  const offerName = `${args.name} - Modifications`;
  const offerResponse = await makeTargetRequest(config, 'POST', '/target/offers/content', {
    name: offerName,
    content: `<script>${args.modifications}</script>`,
  }, 'v2');

  const offerId = offerResponse.id;

  // Parse the URL to get the domain for audience targeting
  const targetUrl = new URL(args.url);

  // Build the XT activity
  const activity = {
    name: args.name,
    state: 'saved', // Start in draft mode
    priority: args.priority || 5,
    workspace: config.workspaceId || undefined,
    locations: {
      mboxes: [
        {
          name: 'target-global-mbox',
          experiences: [
            {
              name: 'Experience A',
              audienceIds: args.audienceIds || [],
              visitorPercentage: 100,
              options: [
                {
                  offerId: offerId,
                },
              ],
            },
          ],
        },
      ],
    },
  };

  const result = await makeTargetRequest(config, 'POST', '/target/activities/xt', activity, 'v3');
  result.offerCreated = { id: offerId, name: offerName };

  // Build instructions based on whether audiences were assigned
  const audienceInfo = args.audienceIds && args.audienceIds.length > 0
    ? `Audience targeting: ${args.audienceIds.length} audience(s) assigned (IDs: ${args.audienceIds.join(', ')})`
    : 'Audience targeting: All Visitors (no specific audience assigned)';

  result.instructions = [
    `Activity "${args.name}" created successfully in DRAFT mode`,
    `Offer ID: ${offerId}`,
    `Activity ID: ${result.id}`,
    audienceInfo,
    'Next steps:',
    '1. Review the activity in Adobe Target UI',
    '2. Verify audience targeting is correct',
    `3. When ready, use updateActivityState with ID ${result.id} and state "approved" to activate`,
  ];

  // Include validation warnings if any
  if (validationWarnings.length > 0) {
    result.validationWarnings = validationWarnings;
    result.instructions.unshift('VALIDATION WARNINGS DETECTED - Review before activating:');
    validationWarnings.forEach(warning => result.instructions.unshift(`  - ${warning}`));
    result.instructions.unshift('');
  }

  return result;
}
