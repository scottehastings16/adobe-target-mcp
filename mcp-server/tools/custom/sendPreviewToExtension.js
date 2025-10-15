/**
 * Send Preview to Chrome DevTools Tool
 * Provides instructions for previewing modifications using Chrome DevTools MCP
 */

export const tool = {
  name: 'sendPreviewToExtension',
  description: `Generate a preview script for Chrome DevTools MCP to inject modifications into a live page.

WORKFLOW REQUIREMENTS FOR LLM:
1. Before calling this tool, explain to the user what modifications you're about to preview
2. Show them the specific selectors and changes (e.g., "I'll change the button .cta-primary to have a blue background")
3. Call this tool to get the preview script
4. Use Chrome DevTools MCP 'navigate_to' to load the page (if not already open)
5. Use Chrome DevTools MCP 'evaluate_script' with the provided script to inject the modifications
6. Ask the user to review the changes visually in their browser
7. Wait for user approval before creating the activity

This approach uses Chrome DevTools MCP and execute_script for live preview`,
  inputSchema: {
    type: 'object',
    properties: {
      modifications: {
        type: 'string',
        description: 'JavaScript code that makes the modifications (CSS changes, text updates, etc.)',
      },
      description: {
        type: 'string',
        description: 'Description of what the modifications do',
      },
      url: {
        type: 'string',
        description: 'The URL where the preview should be shown',
      },
    },
    required: ['modifications', 'description', 'url'],
  },
};

export async function handler(args, context) {
  // Generate a wrapped script that includes the modifications plus a visual indicator
  const previewScript = `
(() => {
  // Apply the modifications
  try {
    ${args.modifications}

    // Add a visual indicator that preview is active
    const indicator = document.createElement('div');
    indicator.id = 'adobe-target-preview-indicator';
    indicator.style.cssText = \`
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #eb1000 0%, #ff5a00 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(235, 16, 0, 0.3);
      cursor: pointer;
      animation: fadeIn 0.3s ease-in;
    \`;
    indicator.innerHTML = '🎯 Target Preview Active';
    indicator.title = 'Click to remove preview';

    // Add animation
    const style = document.createElement('style');
    style.textContent = \`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    \`;
    document.head.appendChild(style);

    // Click to remove indicator
    indicator.addEventListener('click', () => {
      indicator.remove();
    });

    document.body.appendChild(indicator);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.getElementById('adobe-target-preview-indicator')) {
        indicator.remove();
      }
    }, 10000);

    return {
      success: true,
      message: 'Preview modifications applied successfully',
      description: '${args.description.replace(/'/g, "\\'")}',
      url: '${args.url}'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
})()`;

  return {
    instructions: [
      '✓ Preview script generated successfully',
      '',
      'NEXT STEPS - Execute these with Chrome DevTools MCP:',
      '',
      '1. Navigate to the target page (if not already open):',
      `   Tool: navigate_to`,
      `   Args: { "url": "${args.url}" }`,
      '',
      '2. Execute the preview script:',
      `   Tool: evaluate_script`,
      `   Args: { "script": "<use the script below>" }`,
      '',
      '3. The page will show a red "🎯 Target Preview Active" indicator',
      '',
      '4. Ask the user to review the visual changes',
      '',
      '5. If approved, proceed with createActivityFromModifications',
    ],
    script: previewScript,
    description: args.description,
    url: args.url,
    chromeDevToolsSteps: {
      step1: {
        tool: 'navigate_to',
        args: { url: args.url },
      },
      step2: {
        tool: 'evaluate_script',
        args: { script: previewScript },
      },
    },
    modifications: args.modifications,
  };
}
