/**
 * Generate Script Tool
 * Generates both preview and production scripts for Adobe Target offers
 */

import { getContentById } from './generateOfferContent.js';

export const tool = {
  name: 'generateScript',
  description: `Generate scripts for HTML offers with both preview and production versions.

IMPORTANT: This tool is ONLY for HTML offers - NOT for JSON offers!
- HTML offers: Use this tool to preview in Chrome
- JSON offers: Skip this tool, go directly to createJsonOffer

This tool takes HTML/CSS/JS modification code and returns:
- preview script: For Chrome DevTools with visual indicator
- cleanContent: Production-ready code for Adobe Target (with <script> tags)

WORKFLOW FOR HTML OFFERS:
1. Generate HTML content using generateOfferContent (type: 'html', customCode: '...')
2. generateOfferContent returns contentId (code is cached, not duplicated)
3. Call THIS TOOL with contentId parameter (NOT the full code - avoids duplication!)
4. This tool retrieves code from cache using contentId
5. Use Chrome DevTools MCP 'navigate_to' to load page (timeout: 30000ms)
6. Use Chrome DevTools MCP 'evaluate_script' with preview script
7. Ask user to review changes in browser
8. Wait for approval
9. Generate tracking code with generateDataLayerEvent
10. Append tracking to cleanContent
11. Call createOffer with final content

INPUT: contentId from generateOfferContent (preferred) OR raw JavaScript code (fallback)
OUTPUT: Preview script (for Chrome) + cleanContent (for Adobe Target)

CRITICAL: Use contentId parameter to avoid duplicating large code blocks in tool calls!`,
  inputSchema: {
    type: 'object',
    properties: {
      contentId: {
        type: 'string',
        description: 'Content ID from generateOfferContent (preferred - avoids code duplication)',
      },
      modifications: {
        type: 'string',
        description: 'JavaScript code that makes the modifications (fallback if contentId not provided)',
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
    required: ['description', 'url'],
  },
};

export async function handler(args, context) {
  // Retrieve modifications from cache if contentId provided, otherwise use direct modifications
  let modifications;
  if (args.contentId) {
    const cachedContent = getContentById(args.contentId);
    if (!cachedContent) {
      throw new Error(`Content ID ${args.contentId} not found in cache. Generate content first using generateOfferContent.`);
    }
    if (cachedContent.type !== 'html') {
      throw new Error(`Content ID ${args.contentId} is type "${cachedContent.type}", but this tool only handles HTML content.`);
    }
    modifications = cachedContent.code;
  } else if (args.modifications) {
    modifications = args.modifications;
  } else {
    throw new Error('Either contentId or modifications parameter is required.');
  }

  // Generate a wrapped script that includes the modifications plus a visual indicator
  const previewScript = `
(() => {
  // Apply the modifications
  try {
    ${modifications}

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
    indicator.innerHTML = 'Target Preview Active';
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

  // Prepare clean content for Adobe Target offer (without preview indicator)
  // Wrap modifications in script tags if they aren't already
  let cleanContent = modifications.trim();

  // Check if content already has script tags
  const hasScriptTags = cleanContent.startsWith('<script>') && cleanContent.endsWith('</script>');

  if (!hasScriptTags) {
    // Wrap in script tags for Adobe Target HTML offer
    cleanContent = `<script>\n${cleanContent}\n</script>`;
  }

  return {
    success: true,
    message: `Preview script generated successfully for ${args.url}. CRITICAL: You MUST execute the 'previewScript' field below using Chrome DevTools MCP evaluate_script tool. DO NOT create a fake placeholder script!`,

    // THE ACTUAL SCRIPT TO RUN - Use this exact value in Chrome DevTools evaluate_script
    previewScript: previewScript,

    // Clean content for final offer creation (after user approval)
    cleanContent: cleanContent,

    description: args.description,
    url: args.url,

    // NEXT STEPS - MANDATORY WORKFLOW
    nextSteps: [
      '1. Navigate to ' + args.url + ' using Chrome DevTools navigate_to (timeout: 30000)',
      '2. CRITICAL: Execute the previewScript field (the ENTIRE string from previewScript field) using Chrome DevTools evaluate_script',
      '3. DO NOT create a fake/placeholder script - use the actual previewScript value!',
      '4. Run automated QA validation:',
      '   - Read mcp-server/helpers/previewQAScript.js',
      '   - Execute it using Chrome DevTools evaluate_script',
      '   - Check the results for issues or warnings',
      '   - If status is "ISSUES_FOUND", report the issues to the user and ask if they want to fix them or proceed anyway',
      '   - If status is "PASS" with only warnings, mention warnings but proceed',
      '5. DO NOT take screenshots - the user will review in their own browser',
      '6. Ask user: "Preview is live. QA validation ' + ('{status}') + '. Please review the changes in your browser. Would you like to proceed with creating the offer?"',
      '7. If approved: generate tracking with generateDataLayerEvent, append to cleanContent, call createOffer'
    ],

    // For backwards compatibility
    script: previewScript,
    modifications: modifications,
    contentId: args.contentId || null,
  };
}