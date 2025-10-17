/**
 * Generate Offer Content Tool
 * Generates HTML or JSON content for Adobe Target offers
 */

// In-memory cache to store generated content and avoid duplication
const contentCache = new Map();
let contentIdCounter = 0;

export const tool = {
  name: 'generateOfferContent',
  description: `Generate content for Adobe Target offers - supports both HTML and JSON offers.

This tool handles the complete content generation workflow:
- Template search and matching
- Custom code generation following Adobe Target rules
- ES5 compatibility, IIFE wrapping, responsive design
- Returns ready-to-use content for preview or offer creation

CRITICAL: This tool ONLY generates content - it does NOT create offers or preview in Chrome.
After generating content, use generateScript for HTML preview, then createOffer/createJsonOffer for API creation.

===============================================================================
COMPLETE WORKFLOW
===============================================================================

TYPICAL REQUEST: "Create content for a hero banner" OR "Generate JSON for feature flags"

STEP 1: DETERMINE CONTENT TYPE
Ask user if unclear:
- "Are you creating HTML content (DOM modifications) or JSON content (data for SPAs)?"
- Default to HTML for most use cases

STEP 2: TEMPLATE DETECTION (AUTOMATIC)
This tool automatically searches for matching templates when called:

The tool will:
1. Analyze your requirements for keywords (accordion, carousel, modal, etc.)
2. Match against available templates with scoring
3. Return matching templates if found (score > 1)
4. Provide template details: name, description, tags, match score

Your workflow when templates are found:
1. Tool returns templatesFound array with matches
2. YOU MUST ask user: "I found a matching template. Would you like to use it or generate custom code?"
3. If user chooses template:
   - Read template file using MCP Resources: mcp-server/templates/{type}/{filename}
   - Parse the template JSON to get variables array
   - Ask user for required variable values
   - Ask about optional variables (show defaults from template)
   - Replace ALL {{VARIABLE}} placeholders with user-provided values
   - Call this tool again with customCode parameter containing populated template
4. If user chooses custom:
   - Continue to STEP 3 for custom code generation

Template keyword matches (automatic):
HTML: accordion, carousel, countdown, cta/button, hero/banner, modal/popup, sticky, tabs
JSON: feature-flags, products/recommendations, pricing/tiers, testimonials

CRITICAL: When templatesFound array has items, ALWAYS ask user before proceeding!

STEP 3: ASK CLARIFYING QUESTIONS
Before generating code:
a) "Do you have links or image assets to use?"
   - If yes: Use exact URLs
   - If no: Add placeholders and document
b) "What page element are you targeting?" (for HTML)
c) "What selector should I use?" (for HTML DOM modifications)
d) For JSON: "What data structure do you need?"

STEP 4: PAGE ANALYSIS (MANDATORY for HTML - Do NOT Skip!)
CRITICAL: You MUST run comprehensive page analysis BEFORE generating any code!

When to analyze:
- ALWAYS for HTML modifications (default behavior)
- Any DOM modifications, insertions, or styling changes
- ANY time you need to understand page structure

How to analyze (REQUIRED WORKFLOW):

1. Navigate to page using Chrome DevTools MCP navigate_to

2. Take initial snapshot to see general structure:
   Use Chrome DevTools MCP take_snapshot

3. Run comprehensive structure analysis script:
   Read the analysis script from: mcp-server/helpers/pageAnalysisScript.js
   Execute it using Chrome DevTools MCP evaluate_script

   This returns:
   - Full parent chains for H1, H2s, CTAs (with classes, IDs, positioning)
   - All section containers on the page
   - Computed styles (position, display, dimensions) at each level
   - Safe insertion points between sections

4. Review the analysis results and document:
   - Target element selector (h1, specific button, etc.)
   - Its complete parent chain up to body
   - Which parent has position:relative (safe for absolute children)
   - Which parent is the actual section container (for sizing)
   - Exact insertion point for new elements (parent + beforeElement)
   - Any positioning constraints (flexbox, grid, widths)

4.5. CONFIRM TARGET ELEMENT WITH USER (MANDATORY):
   After analysis, BEFORE generating any code:

   a) Identify the specific element(s) that match the user's description
      Use the helper script: mcp-server/helpers/identifyTargetElements.js

      Example:
      - Read identifyTargetElements.js
      - Inject it into page with search text: identifyTargetElements('Products')
      - This returns all elements containing "Products" with context

   b) The script returns detailed information about each match:
      - Element tag, classes, text content
      - Location (navigation, hero, footer, sidebar)
      - Position on page (topOffset in pixels)
      - Parent container details
      - Specific selector path
      - Current styles

   c) Present findings to user with clear descriptions:
      "I found X element(s) matching your description:

      1. Products link (A tag) in navigation breadcrumb
         - Located at top of page (80px from top)
         - Parent: <nav class="breadcrumb">

      2. Products heading (H1) in hero section
         - Located mid-page (600px from top)
         - Parent: <div class="hero-content">

      Which element should I target for the modifications?"

   d) WAIT for user confirmation before proceeding
   e) Use the confirmed element's specific selector in code generation

   NEVER assume which element the user wants - ALWAYS confirm first!

5. ONLY AFTER analysis AND confirmation are complete → Generate code with:
   - Specific selectors based on actual DOM structure (NOT generic!)
   - Correct parent containers for positioning
   - Safe insertion points from analysis

CRITICAL SELECTOR RULES:
- NEVER use broad selectors like: querySelector('button'), querySelector('a')
- ALWAYS scope to specific containers from analysis
- Example: If analysis shows hero CTA is in .hero-section, use:

  WRONG:
  var btn = document.querySelector('a'); // Too broad!
  var btn = Array.from(document.querySelectorAll('a')).find(...); // Finds first match anywhere!

  CORRECT:
  var heroSection = document.querySelector('.hero-section'); // From analysis
  var btn = heroSection ? heroSection.querySelector('a.cta-button') : null; // Scoped!

- Always add defensive checks: if (element && element.parentElement) { ... }
- Add at- prefix classes to YOUR new elements so QA can distinguish them

NEVER generate code based on assumptions! Always analyze first!

STEP 5: GENERATE CONTENT

For HTML Content:
- Follow all Adobe Target code generation rules (see below)
- Generate ES5-compatible HTML/CSS/JS
- NO emojis anywhere
- Wrap in IIFE for variable safety
- Responsive design (mobile + desktop)
- Defensive coding (element existence checks)
- CSS injection via JavaScript (no standalone <style> tags)
- Return raw code (no <script> tags - generateScript will add those)

For JSON Content:
- Generate valid JSON structure
- Follow user requirements
- Include all necessary fields
- Validate JSON syntax
- Return as JSON string

STEP 6: SHOW GENERATED CONTENT
- Display the generated content
- Explain what it does
- Ask for user approval/modifications

STEP 7: RETURN CONTENT
Return the generated content for next steps:
- HTML content → goes to generateScript for preview
- JSON content → goes directly to createJsonOffer

===============================================================================
HTML CONTENT GENERATION RULES (CRITICAL - MUST FOLLOW)
===============================================================================

CONTENT RULES:
- NEVER use emojis in generated code, HTML content, text, comments
- Keep all text professional and emoji-free
- Use plain text only

DOM & Element Handling:
- Do NOT use DOM ready functions unless explicitly asked
- Use specific selectors - NEVER broad selectors like 'div', 'span', 'button'
- Modify existing elements - don't replace entire DOM structures
- Use hide/show patterns - toggle visibility vs remove/add
- Insert content carefully

Code Quality & Compatibility:
- ES5 ONLY:
  * NO backticks/template literals (use string concatenation with +)
  * NO arrow functions (use function() {})
  * NO const/let (use var only)
  * NO destructuring, spread operators, ES6+ features

PREVENTING VARIABLE COLLISIONS (CRITICAL):
- ALWAYS wrap code in IIFE: (function() { ... })()
- Use local 'var' variables inside IIFE
- For globals (rare): window.at_variableName = value;
- NEVER bare 'var' at top level

Examples:
CORRECT - Local variables in IIFE:
(function() {
  var button = document.querySelector('.cta');
  var count = 0;
  if (button) {
    button.textContent = 'Click Me';
  }
})();

WRONG - Bare var at top level:
var button = document.querySelector('.cta');  // Creates implicit global
var count = 0;  // Could overwrite page variable

Styling:
- Inline styles for specificity: element.style.property = value
- Inject CSS via JavaScript into <head>
- Prefix new classes with "at-" (e.g., "at-hero-banner", "at-cta-button")
- Never style existing page classes
- Use IDs/specific selectors for existing elements

Responsive Design:
- ALWAYS write responsive code (mobile + desktop)
- Use media queries: @media (max-width: 768px) { ... }
- Mobile: 375px-768px, Desktop: 1024px+
- Avoid fixed widths - use percentages/max-width
- Mobile-first approach
- Touch-friendly sizes on mobile (min 44x44px)

Performance & Safety:
- Cache selectors: var button = document.querySelector('.cta')
- NO polling/setInterval/setTimeout
- Defensive coding: if (element) { modify it }
- Fail gracefully
- No document.write()

Documentation:
- Add inline comments explaining modifications
- Include selector explanations

===============================================================================
JSON CONTENT GENERATION RULES
===============================================================================

- Valid JSON syntax
- Proper escaping of strings
- Consistent structure
- Follow user requirements
- Include all necessary fields
- No trailing commas
- Use double quotes for strings

===============================================================================
WHEN TO USE HTML VS JSON
===============================================================================

Use HTML content for:
- DOM modifications (change text, colors, layout)
- Adding new page elements
- Traditional A/B tests with visual changes
- Experience Targeting (XT) experiences
- Most standard Target use cases

Use JSON content for:
- Single-page applications (SPAs)
- React, Vue, Angular apps
- Headless/API-driven experiences
- Server-side rendering
- Mobile apps consuming JSON
- Feature flags
- Structured data without DOM changes

===============================================================================
IMPORTANT NOTES
===============================================================================

1. This tool ONLY generates content - no preview, no API calls
2. Content is returned WITHOUT tracking code (tracking added later)
3. HTML content is returned WITHOUT <script> tags (generateScript adds those)
4. Templates already follow all rules - use them when possible
5. Always ask clarifying questions before generating
6. Show content to user for approval before proceeding

===============================================================================
NEXT STEPS AFTER CONTENT GENERATION
===============================================================================

For HTML Content:
1. Call generateScript with the generated content → preview + cleanContent
2. Use Chrome DevTools MCP to preview in browser
3. Get user approval
4. Call generateDataLayerEvent for tracking code
5. Append tracking to cleanContent
6. Call createOffer with final content

For JSON Content:
1. Show user the generated JSON
2. Get user approval
3. Call createJsonOffer with the JSON

===============================================================================
EXAMPLES
===============================================================================

Example HTML Request:
User: "Generate a hero banner with blue background"
Tool: Searches templates → Finds hero-banner.json → Asks for variables → Returns populated template

Example JSON Request:
User: "Generate feature flags for new checkout"
Tool: Searches templates → Finds feature-flags.json → Asks for flag names → Returns JSON structure

Example Custom HTML:
User: "Change the CTA button to green"
Tool: Asks for selector → Asks for button text → Generates ES5 code → Returns code

Example Custom JSON:
User: "Create pricing data for 3 tiers"
Tool: Asks for tier details → Generates JSON → Returns structure`,
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['html', 'json'],
        description: 'Type of content to generate: html (for DOM modifications) or json (for data)',
      },
      requirements: {
        type: 'string',
        description: 'Description of what content to generate (e.g., "hero banner with blue background", "feature flags for checkout")',
      },
      template: {
        type: 'string',
        description: 'Optional: Template name to use (e.g., "carousel", "feature-flags"). If not provided, will search for matching template.',
      },
      templateVariables: {
        type: 'object',
        description: 'Optional: Variables to populate in the template (if using template)',
      },
      customCode: {
        type: 'string',
        description: 'Optional: Custom code provided by user (skips generation)',
      },
    },
    required: ['type', 'requirements'],
  },
};

export async function handler(args, context) {
  const contentType = args.type;
  const requirements = args.requirements;

  // If custom code is provided, store it in cache and return ID
  if (args.customCode) {
    const contentId = `content_${++contentIdCounter}`;
    contentCache.set(contentId, {
      type: contentType,
      code: args.customCode,
      requirements: requirements,
      timestamp: Date.now()
    });

    return {
      contentId: contentId,
      contentType: contentType,
      codeLength: args.customCode.length,
      requirements: requirements,
      message: `${contentType.toUpperCase()} content stored with ID: ${contentId}. Pass this ID to next tool (${contentType === 'html' ? 'generateScript' : 'createJsonOffer'}) instead of duplicating code.`
    };
  }

  // If template and variables provided, populate template
  if (args.template && args.templateVariables) {
    // Template population would happen here
    // For now, return instructions to use template
    return {
      contentType: contentType,
      template: args.template,
      variables: args.templateVariables,
      message: `Template "${args.template}" ready to populate. LLM should read template using MCP Resources, replace all {{VARIABLE}} placeholders with provided values, and call this tool again with customCode parameter containing the populated template content.`
    };
  }

  // STEP 1: Search for matching templates based on requirements
  const templateMatches = findMatchingTemplates(requirements, contentType);

  if (templateMatches.length > 0) {
    // Found matching template(s) - return to LLM to ask user
    return {
      contentType: contentType,
      requirements: requirements,
      templatesFound: templateMatches,
      message: `TEMPLATE MATCH FOUND! Before generating custom code, present these template options to the user:

${templateMatches.map((t, i) => `${i + 1}. "${t.name}" (${t.file})
   Description: ${t.description}
   Tags: ${t.tags.join(', ')}
   Match score: ${t.matchScore}/10`).join('\n\n')}

NEXT STEPS FOR LLM:
1. Present template options to user with AskUserQuestion tool or direct message
2. Ask: "I found ${templateMatches.length} matching template${templateMatches.length > 1 ? 's' : ''}. Would you like to use one of these templates or generate custom code?"
3. If user chooses template:
   - Read the template file using MCP Resources: mcp-server/templates/${contentType}/${templateMatches[0].file}
   - Ask user for required variable values
   - Populate template by replacing {{VARIABLE}} placeholders
   - Call THIS TOOL AGAIN with customCode parameter
4. If user chooses custom:
   - Proceed with custom code generation following all rules
   - Call THIS TOOL AGAIN with customCode parameter

DO NOT generate custom code until user has made a choice!`
    };
  }

  // No template matches found - proceed with custom generation instructions
  return {
    contentType: contentType,
    requirements: requirements,
    templatesFound: [],
    message: `No matching templates found for "${requirements}".

INSTRUCTIONS FOR LLM:
1. Generate custom ${contentType.toUpperCase()} content following all rules in description
2. For HTML: Follow page analysis workflow, confirm target element, generate ES5/IIFE code
3. For JSON: Generate valid JSON structure per requirements
4. Once generated, call THIS TOOL AGAIN with customCode parameter containing the generated code
5. The tool will store the code and return a contentId
6. Pass the contentId (NOT the code) to subsequent tools to avoid duplication

CRITICAL: Generate code ONCE, store it here, then reference by ID in all subsequent tool calls.`
  };
}

// Helper function to find matching templates based on keywords
function findMatchingTemplates(requirements, contentType) {
  const lowerReq = requirements.toLowerCase();

  // Template keyword mappings
  const templateKeywords = {
    'accordion.json': {
      keywords: ['accordion', 'collapsible', 'expandable', 'faq', 'toggle', 'sections'],
      name: 'Accordion (Collapsible Sections)',
      description: 'Accordion/collapsible sections for FAQ, product details, or any expandable content',
      tags: ['accordion', 'collapsible', 'expandable', 'faq', 'details', 'toggle']
    },
    'carousel.json': {
      keywords: ['carousel', 'slider', 'gallery', 'slideshow', 'image slider'],
      name: 'Carousel/Slider',
      description: 'Image carousel or content slider with navigation',
      tags: ['carousel', 'slider', 'gallery', 'slideshow']
    },
    'countdown-timer.json': {
      keywords: ['countdown', 'timer', 'clock', 'deadline', 'expiration', 'time limit'],
      name: 'Countdown Timer',
      description: 'Countdown timer for promotions, launches, or deadlines',
      tags: ['countdown', 'timer', 'urgency', 'deadline']
    },
    'cta-button.json': {
      keywords: ['button', 'cta', 'call to action', 'link button'],
      name: 'CTA Button',
      description: 'Call-to-action button with customizable styling',
      tags: ['button', 'cta', 'call-to-action']
    },
    'hero-banner.json': {
      keywords: ['hero', 'banner', 'hero section', 'hero banner', 'main banner'],
      name: 'Hero Banner',
      description: 'Hero banner with headline, description, and CTA',
      tags: ['hero', 'banner', 'header']
    },
    'modal.json': {
      keywords: ['modal', 'popup', 'dialog', 'overlay', 'lightbox'],
      name: 'Modal/Popup',
      description: 'Modal dialog or popup overlay',
      tags: ['modal', 'popup', 'dialog', 'overlay']
    },
    'sticky-header.json': {
      keywords: ['sticky', 'fixed', 'sticky header', 'announcement', 'notification bar'],
      name: 'Sticky Header',
      description: 'Sticky header or announcement bar',
      tags: ['sticky', 'fixed', 'header', 'announcement']
    },
    'tabs.json': {
      keywords: ['tabs', 'tabbed', 'tab navigation', 'tab panel'],
      name: 'Tabs',
      description: 'Tabbed content panels for organizing information',
      tags: ['tabs', 'navigation', 'panels']
    },
    'feature-flags.json': {
      keywords: ['feature flag', 'feature toggle', 'flag', 'toggle', 'enable', 'disable'],
      name: 'Feature Flags',
      description: 'Feature flags for enabling/disabling functionality',
      tags: ['feature-flags', 'toggles', 'config']
    },
    'product-recommendations.json': {
      keywords: ['product', 'recommendation', 'suggested', 'related products', 'product list'],
      name: 'Product Recommendations',
      description: 'Product recommendation data structure',
      tags: ['products', 'recommendations', 'commerce']
    },
    'pricing-data.json': {
      keywords: ['pricing', 'price', 'tier', 'plan', 'subscription'],
      name: 'Pricing Data',
      description: 'Pricing tiers and plan information',
      tags: ['pricing', 'plans', 'tiers']
    }
  };

  const matches = [];

  for (const [file, data] of Object.entries(templateKeywords)) {
    // Skip if wrong content type
    const isHtmlTemplate = file.endsWith('.json') && !['feature-flags.json', 'product-recommendations.json', 'pricing-data.json', 'testimonials.json', 'navigation-menu.json', 'form-config.json', 'hero-config.json', 'personalization-content.json', 'ab-test-variant.json'].includes(file);
    const expectedType = isHtmlTemplate ? 'html' : 'json';
    if (contentType !== expectedType) continue;

    // Calculate match score
    let matchScore = 0;
    for (const keyword of data.keywords) {
      if (lowerReq.includes(keyword)) {
        matchScore += 2; // Strong match
      }
    }

    // Check partial matches in name/description
    const words = lowerReq.split(/\s+/);
    for (const word of words) {
      if (word.length > 3) {
        if (data.name.toLowerCase().includes(word)) matchScore += 1;
        if (data.description.toLowerCase().includes(word)) matchScore += 0.5;
      }
    }

    if (matchScore > 1) {
      matches.push({
        file: file,
        name: data.name,
        description: data.description,
        tags: data.tags,
        matchScore: Math.min(10, Math.round(matchScore))
      });
    }
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

// Export function to retrieve content by ID (for use by other tools)
export function getContentById(contentId) {
  return contentCache.get(contentId);
}
