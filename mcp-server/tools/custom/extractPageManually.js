/**
 * Extract Page Manually Tool
 *
 * Fallback tool for when Chrome DevTools MCP hits size limits.
 * Provides instructions for manual HTML extraction via browser DevTools.
 */

export const tool = {
  name: 'extractPageManually',
  description: `Fallback workflow for extracting page data when Chrome DevTools MCP fails due to size limits.

Use this when:
- Chrome DevTools MCP returns "result too large" error
- Automated extraction hits MCP protocol size limits
- Need manual control over what HTML is extracted

This tool provides step-by-step instructions for the user to manually extract HTML and provide it to extractPageStructure.`,
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL the user should extract from',
      },
    },
    required: ['url'],
  },
};

export async function handler(args) {
  return {
    workflow: 'manual-extraction',
    instructions: [
      '=== MANUAL EXTRACTION WORKFLOW ===',
      '',
      'Chrome DevTools MCP hit a size limit. Please extract the HTML manually:',
      '',
      `STEP 1: Open the page in Chrome`,
      `  - Navigate to: ${args.url}`,
      `  - Wait for the page to fully load`,
      '',
      'STEP 2: Open Chrome DevTools',
      '  - Press F12 or Right-click → Inspect',
      '  - Go to the Elements tab',
      '',
      'STEP 3: Copy the HTML',
      '  - In the Elements panel, find the <html> tag (usually at the top)',
      '  - Right-click on <html>',
      '  - Select "Copy" → "Copy outerHTML"',
      '  - The full page HTML is now in your clipboard',
      '',
      'STEP 4: Provide the HTML to Claude',
      '  - Paste the HTML in your next message',
      '  - Or save it to a file and tell Claude the file path',
      '',
      'ALTERNATIVE - Extract Just What You Need:',
      '  - Instead of copying the full <html>',
      '  - Find the specific section you want to modify (e.g., <main>, <section id="hero">)',
      '  - Right-click that element → Copy outerHTML',
      '  - This will be smaller and easier to work with',
      '',
      'AFTER YOU PROVIDE THE HTML:',
      '  Claude will use extractPageStructure to save it and create a summary',
      '  Then you can use queryPageStructure to find elements without re-sending the HTML',
    ],
    nextSteps: {
      whenUserProvidesHTML: 'Call extractPageStructure with the HTML',
      whenUserProvidesFilePath: 'Read the file, then call extractPageStructure',
    },
    example: {
      userMessage: 'Here is the HTML: <!DOCTYPE html><html>...</html>',
      claudeResponse: 'extractPageStructure({ url: "' + args.url + '", pageData: { html: "<user-provided-html>" } })',
    },
    tips: [
      'TIP: For large pages, extract only the section you need to modify',
      'TIP: Some pages have 1MB+ of HTML - extract specific sections instead of the full page',
      'TIP: You can extract multiple sections separately and work with them individually',
    ],
  };
}
