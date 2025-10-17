/**
 * Create Offer Tool
 * Creates HTML offers in Adobe Target via API
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createOffer',
  description: `Create an HTML offer in Adobe Target via API.

This tool ONLY handles the API call to create an offer - it does NOT generate content.

WORKFLOW:
1. Generate content using generateOfferContent tool
2. Package for preview using generateScript tool (returns cleanContent)
3. Preview in Chrome and get user approval
4. Generate tracking code using generateDataLayerEvent tool
5. Append tracking to cleanContent
6. MANDATORY: Ask user for explicit approval to create offer in Adobe Target
7. Call THIS TOOL with final content (cleanContent + tracking) AND userApproved: true

CRITICAL USER APPROVAL REQUIREMENT:
- NEVER call this tool without explicit user approval
- User has already reviewed the offer during preview step
- You MUST ask: "Do you approve creating this offer in Adobe Target?"
- ONLY call this tool if user explicitly approves (yes, approve, go ahead, create it, etc.)
- Set userApproved: true ONLY after user confirms
- If user says no, do NOT call this tool

CRITICAL NOTES:
- This creates OFFERS, not activities
- Offers are fully editable in Adobe Target UI
- Users build activities in Target UI using these offers
- Content parameter should be complete HTML/CSS/JS with <script> tags
- For content generation workflow, see generateOfferContent tool
- For JSON offers, use createJsonOffer instead

WHEN TO USE:
- After content generation and preview approval
- After tracking code has been added
- After user has explicitly approved offer creation
- Ready to create the offer in Adobe Target

INPUT REQUIREMENTS:
- name: Clear offer name (e.g., "Hero Banner - Variant A")
- content: Complete HTML with <script> tags and tracking code
- userApproved: MUST be true (only set after explicit user approval)`,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Offer name',
      },
      content: {
        type: 'string',
        description: 'Complete HTML/CSS/JavaScript content with <script> tags',
      },
      userApproved: {
        type: 'boolean',
        description: 'User approval confirmation. MUST be true. Only set to true after user explicitly approves offer creation.',
      },
      workspace: {
        type: 'string',
        description: 'Workspace ID (optional). If not provided, uses default from config',
      },
    },
    required: ['name', 'content', 'userApproved'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  // CRITICAL: Check for user approval
  if (args.userApproved !== true) {
    throw new Error(
      'User approval required before creating offer in Adobe Target.\n\n' +
      'You MUST ask: "Do you approve creating this offer in Adobe Target?"\n' +
      'Wait for explicit user approval, then call this tool with userApproved: true\n\n' +
      'Do NOT create offers without user permission.'
    );
  }

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
