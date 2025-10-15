/**
 * Create Offer Tool
 * Create a new offer
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createOffer',
  description: `Create a new offer with HTML/CSS/JavaScript content.

PRIMARY WORKFLOW - THIS IS THE MAIN TOOL FOR ADOBE TARGET DEVELOPMENT

Offers created via API CAN be edited in Adobe Target UI (unlike activities).
This makes offer creation the PRIMARY and RECOMMENDED workflow.

===============================================================================
COMPLETE A/B TEST WORKFLOW (USE THIS APPROACH FOR ALL TARGET DEVELOPMENT)
===============================================================================

When a user asks to create an A/B test, experience, or personalization:

STEP 1: ASK CLARIFYING QUESTIONS
Before generating any code, ask the user:
a) "Do you have any links or image assets that need to be used?"
   - If yes: Use their exact URLs
   - If no: Use placeholders and document them
b) "How many variations do you want to test?" (if not specified)
c) "What page element are you targeting?" (if not clear)
d) "Would you like me to create the offers in Target, or just show you the code?"
   - If "create offers": Follow STEP 2A
   - If "just show code": Follow STEP 2B

STEP 2A: GENERATE AND CREATE OFFERS (Use This Tool)
For each variation:
- Generate optimized HTML/CSS/JS code following all Adobe Target rules below
- Show the code to the user first
- Ask: "Should I create this offer in Adobe Target?"
- If yes: Create offer via createOffer tool and save the returned offer ID
- If no: Just provide the code for manual use

Example:
Control Offer ID: 2299231
Variant Offer ID: 2299232

STEP 2B: GENERATE CODE ONLY (No Tool Call)
For each variation:
- Generate optimized HTML/CSS/JS code following all Adobe Target rules below
- Show the code with explanation
- Provide manual instructions: "You can copy this code and paste it into Target UI when creating your offer manually"

STEP 3: PROVIDE NEXT STEPS TO USER
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

ADOBE TARGET CODE GENERATION RULES (CRITICAL - MUST FOLLOW):
When generating code for the content parameter, you MUST follow these rules:

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
- Use the generateDataLayerEvent tool to generate tracking code
- Attach click/submit event listeners that fire: dataLayer.push({event: "target_conversion", at_activity: "...", at_experience: "..."})
- Event structure must be: event="target_conversion", at_activity="...", at_experience="..."
- NO template literals - use string concatenation only for ES5 compatibility
- Example: element.addEventListener('click', function() { dataLayer.push({event: 'target_conversion', at_activity: 'Hero Test', at_experience: 'Variant A'}); });`,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Offer name',
      },
      content: {
        type: 'string',
        description: 'Offer content (HTML/CSS/JavaScript). Wrap JavaScript in <script> tags and CSS in <style> tags.',
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
