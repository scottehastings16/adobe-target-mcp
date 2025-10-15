/**
 * Create JSON Offer Tool
 * Create a new JSON offer
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createJsonOffer',
  description: `Create a new JSON offer for use with Adobe Target activities.

JSON offers are used to deliver structured data to your application, typically for:
- Single Page Applications (SPAs)
- Mobile apps
- Headless experiences
- API-driven content delivery
- Dynamic data injection

USAGE:
JSON offers allow you to return structured data instead of HTML. The content should be a valid JSON object that your application can consume.

WORKFLOW:
1. Define your JSON structure (e.g., product data, configuration, feature flags)
2. Create the offer with this tool
3. Use the returned offer ID in your Target activity
4. Your application receives the JSON when the activity fires

IMPORTANT:
- Content must be a valid JSON object
- Offers created via API CAN be edited in Adobe Target UI
- Use with Form-Based Experience Composer or server-side decisioning
- Workspace parameter is optional (uses TARGET_WORKSPACE_ID from config if not provided)

EXAMPLES:

1. Product Recommendations:
{
  "products": [
    {"id": "123", "name": "Widget", "price": 29.99},
    {"id": "456", "name": "Gadget", "price": 49.99}
  ],
  "layout": "grid"
}

2. Feature Flags:
{
  "features": {
    "newCheckout": true,
    "darkMode": false,
    "beta": true
  }
}

3. Hero Banner Configuration:
{
  "heading": "Summer Sale",
  "subheading": "Save up to 50%",
  "ctaText": "Shop Now",
  "ctaUrl": "/sale",
  "imageUrl": "https://example.com/banner.jpg",
  "backgroundColor": "#FF5733"
}

4. A/B Test Variant Data:
{
  "variant": "B",
  "buttonColor": "green",
  "buttonText": "Get Started Now",
  "headline": "Transform Your Business Today"
}`,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Offer name (e.g., "Product Recommendations - Summer Sale")',
      },
      content: {
        type: 'object',
        description: 'JSON object containing the offer data. Must be a valid JSON object that your application will consume.',
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

  return await makeTargetRequest(config, 'POST', '/target/offers/json', payload, 'v2');
}
