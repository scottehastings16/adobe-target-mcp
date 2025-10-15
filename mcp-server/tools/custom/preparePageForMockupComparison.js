/**
 * Prepare Page for Mockup Comparison Tool
 * Extract detailed page structure for comparing against a mockup screenshot
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'preparePageForMockupComparison',
  description: `Extract detailed page structure to prepare for mockup comparison and experience generation.

MOCKUP-TO-EXPERIENCE WORKFLOW:
This tool is the FIRST STEP when a user provides a mockup/screenshot and wants to create an experience.

Workflow:
1. User provides: mockup screenshot + target URL
2. LLM calls THIS TOOL with the URL to get current page structure
3. LLM analyzes mockup image (using vision) vs current page data
4. LLM identifies differences (layout, colors, text, positioning, etc.)
5. LLM generates ES5 modification code following ALL Adobe Target coding rules
6. LLM shows user the proposed changes for approval
7. LLM calls createActivityFromModifications to deploy

IMPORTANT INSTRUCTIONS FOR LLM:
When user provides a mockup/screenshot:
1. Ask user: "What's the URL of the page this mockup is for?"
2. Ask user: "Do you have any links or image assets that need to be used in this experience?"
   - If user provides links/images: Use the exact URLs provided
   - If user says "no" or doesn't provide assets: Use placeholder links (e.g., "https://example.com/image.jpg" or "#")
3. Call THIS TOOL with the URL
4. Analyze the mockup screenshot carefully:
   - Identify visual differences from current page
   - Note layout changes, color changes, text changes, new elements
   - Look for CSS properties: colors, fonts, spacing, positioning
   - Identify which elements need modification (use specific selectors)
4. Generate modification code that:
   - Follows ALL Adobe Target code generation rules (ES5 only, at- prefix, etc.)
   - Uses specific selectors (IDs, data attributes, NOT broad classes)
   - Waits for elements to exist before modifying
   - Is well-commented explaining each change
5. Show user the generated code and explain the changes
6. After approval, call createActivityFromModifications

KEY ANALYSIS POINTS:
- Compare mockup colors vs current page colors
- Compare mockup text vs current page text
- Compare mockup layout/positioning vs current page
- Identify new elements in mockup that need to be created
- Identify hidden elements that need to be shown/hidden
- Note font changes, size changes, spacing changes`,
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL of the page to analyze',
      },
      focusArea: {
        type: 'string',
        description: 'Optional: Specific section to focus on (e.g., "hero section", "navigation", "footer"). If not provided, analyzes entire page.',
      },
    },
    required: ['url'],
  },
};

export async function handler(args, context) {
  const { tempFilePath } = context;

  // This tool provides instructions and structure for mockup analysis
  // The actual Chrome DevTools inspection happens via the chrome-devtools MCP

  return {
    success: true,
    url: args.url,
    focusArea: args.focusArea || 'entire page',
    instructions: [
      '✓ Page URL received: ' + args.url,
      '',
      'NEXT STEPS FOR MOCKUP ANALYSIS:',
      '',
      '0. GATHER ASSETS (if not already done):',
      '   - Ask user: "Do you have any links or image assets for this experience?"',
      '   - If no assets provided, use placeholders and document them',
      '',
      '1. USE CHROME DEVTOOLS MCP:',
      '   - Navigate to the URL',
      '   - Extract DOM structure and element details',
      '   - Take screenshot of current state',
      '   - Get computed styles of key elements',
      '',
      '2. ANALYZE THE MOCKUP (using vision):',
      '   - Identify all visual differences from current page',
      '   - Note specific elements that need changes',
      '   - Document colors, fonts, spacing, layout differences',
      '   - Find precise selectors for each element to modify',
      '',
      '3. GENERATE MODIFICATION CODE:',
      '   - Use ES5 JavaScript only (no backticks, arrow functions, const/let)',
      '   - Prefix all new classes with "at-"',
      '   - Use specific selectors (IDs, data attributes)',
      '   - Wait for elements with polling pattern',
      '   - Add detailed comments explaining each change',
      '',
      '4. VALIDATION:',
      '   - Show user the generated code',
      '   - Explain what will change on the page',
      '   - Get approval before creating activity',
      '',
      '5. CREATE ACTIVITY:',
      '   - Use createActivityFromModifications tool',
      '   - Provide clear activity name describing the test',
    ],
    chromeDevToolsActions: [
      'Use Chrome DevTools MCP to navigate to: ' + args.url,
      'Extract DOM structure (especially ' + (args.focusArea || 'hero, navigation, and main content areas') + ')',
      'Get element selectors (IDs, classes, data attributes)',
      'Get computed styles for key elements',
      'Take screenshot for comparison with mockup',
    ],
    mockupAnalysisChecklist: [
      '□ What text content is different?',
      '□ What colors are different? (backgrounds, text, borders)',
      '□ What fonts/sizes are different?',
      '□ What layout/positioning is different?',
      '□ What elements are new/added?',
      '□ What elements are hidden/removed?',
      '□ What images are different?',
      '□ What spacing/margins/padding are different?',
      '□ What element dimensions (width/height) are different?',
      '□ What interactive elements (buttons, links) are different?',
    ],
    codeGenerationReminders: [
      '✓ ES5 only - NO backticks, arrow functions, const/let, template literals',
      '✓ All new classes prefixed with "at-"',
      '✓ Use specific selectors - NOT broad classes like .button',
      '✓ Wait for elements to exist using polling pattern',
      '✓ Wrap in IIFE to avoid global pollution',
      '✓ Add detailed comments',
      '✓ Cache DOM queries',
      '✓ Use inline styles for specificity',
    ],
  };
}
