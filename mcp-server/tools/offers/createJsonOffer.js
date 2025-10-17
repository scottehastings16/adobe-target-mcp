/**
 * Create JSON Offer Tool
 * Creates JSON offers in Adobe Target via API
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createJsonOffer',
  description: `Create a JSON offer in Adobe Target via API.

This tool ONLY handles the API call to create a JSON offer - it does NOT generate content.

WORKFLOW:
1. Generate JSON content using generateOfferContent tool (type: 'json')
2. Show JSON to user for review
3. MANDATORY: Ask user for explicit approval to create offer in Adobe Target
4. Call THIS TOOL with final JSON content AND userApproved: true

CRITICAL USER APPROVAL REQUIREMENT:
- NEVER call this tool without explicit user approval
- User has already reviewed the JSON content
- You MUST ask: "Do you approve creating this JSON offer in Adobe Target?"
- ONLY call this tool if user explicitly approves (yes, approve, go ahead, create it, etc.)
- Set userApproved: true ONLY after user confirms
- If user says no, do NOT call this tool

CRITICAL NOTES:
- This creates JSON OFFERS, not activities
- JSON offers are for SPAs, server-side, mobile apps, headless experiences
- Offers are fully editable in Adobe Target UI
- Users build activities in Target UI using these offers
- Content parameter should be valid JSON object
- For HTML offers, use createOffer instead
- For content generation workflow, see generateOfferContent tool

WHEN TO USE:
- After JSON content generation and user review
- After user has explicitly approved offer creation
- Ready to create the JSON offer in Adobe Target
- User explicitly needs JSON (not HTML/DOM modifications)

USE CASES FOR JSON OFFERS:
- Single Page Applications (React, Vue, Angular)
- Server-side rendering (Node.js, Java, .NET, Python)
- Mobile apps (iOS, Android)
- Headless/API-driven experiences
- Cross-channel delivery (email, IoT, kiosks, connected TV)
- Feature flags and configuration data
- Product/pricing data for e-commerce

INPUT REQUIREMENTS:
- name: Clear offer name (e.g., "Product Recommendations - Variant A")
- content: Valid JSON object (your application will consume this)
- userApproved: MUST be true (only set after explicit user approval)`,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Offer name',
      },
      content: {
        type: 'object',
        description: 'Valid JSON object containing the offer data',
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
      'User approval required before creating JSON offer in Adobe Target.\n\n' +
      'You MUST ask: "Do you approve creating this JSON offer in Adobe Target?"\n' +
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

  return await makeTargetRequest(config, 'POST', '/target/offers/json', payload, 'v2');
}
