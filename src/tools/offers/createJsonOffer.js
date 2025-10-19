/**
 * Create JSON Offer Tool
 * Create a new JSON offer
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createJsonOffer',
  description: `SPECIALIZED TOOL - FOR SPAs, SERVER-SIDE, MOBILE, AND HEADLESS

Create JSON offers for applications that consume structured data (not HTML/DOM changes).

DO NOT USE THIS AS THE DEFAULT - Use createOffer (HTML) for most use cases!

CRITICAL: THIS TOOL CREATES OFFERS, NOT ACTIVITIES
When users mention activity types like "A/B test", "XT", "Experience Targeting", etc., they are describing HOW the offer will be used, NOT what to create via API. ALWAYS create an OFFER using this tool, then the user builds the activity in Target UI.

===============================================================================
COMPLETE END-TO-END WORKFLOW FOR JSON OFFERS
===============================================================================

TYPICAL REQUEST: "Create A/B test for product recommendations data in my React app"

STEP 1: SHOW JSON TO USER IN MCP CLIENT
Before creating the offer, display the JSON structure to the user in the MCP client output.
Ask: "Here's the JSON I'll create. Does this look correct?"

Example:
User: "Create JSON offer with product recommendations"
LLM: "I'll create this JSON offer:

\`\`\`json
{
  "products": [
    {"id": "123", "name": "Widget", "price": 29.99},
    {"id": "456", "name": "Gadget", "price": 49.99}
  ],
  "layout": "grid"
}
\`\`\`

Does this structure look correct for your needs?"

User reviews the JSON in the MCP client → Confirms → LLM proceeds to Step 2

STEP 2: CREATE JSON OFFERS (After User Approval)
Create one JSON offer per variation/experience:

A/B Test Pattern (Most Common):
- Control Offer: Original/baseline data configuration
- Variant Offer: New data configuration being tested
- Total: 2 JSON offers

Example A/B Test:
User: "Test 2 different product recommendation algorithms"
→ Control Offer: {"algorithm": "collaborative", "maxItems": 4}
→ Variant Offer: {"algorithm": "content-based", "maxItems": 6}
→ User creates A/B activity in Target UI with these 2 JSON offers

Experience Targeting (XT) Pattern:
- One JSON offer per audience segment
- Each offer contains data tailored to specific audience
- Total: 1+ JSON offers

Example XT:
User: "Show different features to free vs premium users"
→ Free User Offer: {"features": ["basic", "limited"], "upsell": true}
→ Premium User Offer: {"features": ["advanced", "unlimited", "priority"], "upsell": false}
→ User creates XT activity in Target UI with these 2 JSON offers + audience rules

Feature Flags Pattern:
- JSON offers control feature availability
- A/B test feature enablement

Example Feature Flags:
User: "Test new checkout flow with 50% of users"
→ Control Offer: {"newCheckout": false, "checkoutVersion": "v1"}
→ Variant Offer: {"newCheckout": true, "checkoutVersion": "v2"}

IMPORTANT JSON OFFER RULES:
1. Create separate JSON offers for each variation (don't combine in one offer)
2. Each JSON offer should have consistent schema (same keys, different values)
3. Your application must handle consuming and applying the JSON data
4. Name offers clearly: "[Test Name] - [Variation Name]"

STEP 3: PROVIDE OFFER IDs TO USER (Required)
After creating JSON offers, tell the user:

"I've created [N] JSON offers for your [activity type]:

OFFER IDs:
- [Offer Name]: ID [12345]
- [Offer Name]: ID [67890]

NEXT STEPS - Create Activity in Adobe Target UI:
1. Go to Adobe Target → Activities → Create Activity → [A/B Test | Experience Targeting | etc.]
2. Choose Form-Based Experience Composer
3. Set location to: target-global-mbox (or your preferred mbox)
4. For Experience A:
   - Click 'Change Content' → JSON Offer
   - Search for offer ID: [12345]
   - Select the offer
5. Click 'Add Experience' for Experience B
   - Select offer ID: [67890]
6. Configure traffic allocation
7. Set up success metrics
8. Name your activity and save

APPLICATION INTEGRATION:
Your application needs to retrieve and use the JSON offer:

Client-side (SPA with at.js):
adobe.target.getOffer({
  mbox: "target-global-mbox",
  success: function(offer) {
    var jsonData = offer[0].content; // Your JSON data
    // Use jsonData to configure your app
  }
});

Server-side (Node.js, Java, .NET, Python):
Use Adobe Target Delivery API or SDK to retrieve JSON offer
Parse the JSON and use it to configure server-side rendering

Mobile (iOS, Android):
Use Adobe Target Mobile SDK to retrieve JSON offer
Parse and apply to mobile app UI/behavior"

CONTROL VS VARIANT GUIDANCE FOR JSON OFFERS:

What is a Control?
- The baseline data configuration (current algorithm, current settings)
- Used to compare performance against new configurations

What is a Variant?
- The new data configuration being tested
- Different values/settings you're testing for better performance

How many JSON offers to create:

A/B Test (2 JSON offers):
→ Control: Current configuration
→ Variant A: New configuration

A/B/n Test (3+ JSON offers):
→ Control: Current configuration
→ Variant A: First alternative configuration
→ Variant B: Second alternative configuration

Experience Targeting (1+ JSON offers):
→ One JSON offer per audience segment
→ Each with data tailored to that segment

Example conversation:
User: "A/B test product recommendations"
LLM: "I'll create 2 JSON offers for your A/B test:
1. Control - current recommendation algorithm
2. Variant - new recommendation algorithm
What data should each offer contain?"

WHEN TO USE THIS TOOL (JSON OFFERS):
- User explicitly asks for "JSON offer" or "JSON content"
- User mentions "SPA", "React", "Vue", "Angular", "single-page application"
- User mentions "server-side", "backend", "API", "SDK" (Node.js, Java, .NET, Python)
- User mentions "mobile app" (iOS, Android)
- User mentions "headless", "API-driven", "cross-channel"
- User mentions "IoT", "kiosk", "connected TV", "email personalization"
- User wants structured data that their application will consume
- User is testing different data configurations (feature flags, product data, pricing, etc.)

WHEN NOT TO USE (Use createOffer instead):
- User asks to create/modify page elements (carousel, button, banner, modal, etc.)
- Traditional A/B tests with visual changes
- DOM modifications
- Adding HTML content to the page
- Most standard Target use cases (95%+ of requests)

IF USER REQUEST IS AMBIGUOUS:
Ask: "How will this content be used?"
- "Will your application consume this as JSON data (SPA, server-side, mobile app)?"
- "Or do you want to modify the page's HTML/DOM directly (change buttons, add banners, etc.)?"

Decision:
- If user says "consume as JSON" or "server-side" or "mobile app" → Use this tool (createJsonOffer)
- If user says "modify page" or "change HTML" or "add elements" → Use createOffer instead
- Default to createOffer (HTML) if still unclear after asking

WHY USE THIS TOOL (when appropriate):
- JSON offers created via API CAN be fully edited in Adobe Target UI
- User maintains full control and flexibility in Target UI
- User can build/modify activities in Target manually
- No limitations or restrictions

JSON offers deliver structured data to your application, typically for:
- Single Page Applications (SPAs) - React, Vue, Angular consuming JSON client-side
- Server-side integrations - Node.js, Java, .NET, Python SDKs consuming JSON
- Mobile apps - iOS, Android apps consuming JSON via Adobe Target Mobile SDKs
- Headless/API-driven experiences - Decoupled frontend consuming Target decisioning
- Cross-channel delivery - Email, IoT, kiosks, connected TVs
- Feature flags and configuration data - Dynamic app behavior
- Product/pricing data - E-commerce personalization

HOW JSON OFFERS WORK:
- JSON offers are NOT automatically applied to the page (unlike HTML offers)
- Your application must explicitly retrieve the JSON offer using:
  * Client-side: Target's at.js getOffer() method for SPAs
  * Server-side: Target Delivery API or SDKs (Node.js, Java, .NET, Python)
  * Mobile: Adobe Target Mobile SDKs
- Your application consumes the JSON and renders/uses it however needed
- Example: Target returns {"buttonColor": "green", "headline": "Sale!"}, your app reads and applies it

After creating the JSON offer, user builds the activity in Target UI (recommended workflow).

===============================================================================
TEMPLATE SEARCH WORKFLOW (Do This First):
===============================================================================

Before creating JSON from scratch, search for existing templates that match the user's request:

1. SEARCH FOR MATCHING TEMPLATES:
   - Use MCP Resources to access templates (URIs like template://json/feature-flags)
   - Look for templates matching user's request by:
     * Template name (e.g., "feature-flags" for "feature flags")
     * Keywords and descriptions
   - Common template matches:
     * "products", "recommendations", "ecommerce" → template://json/product-recommendations
     * "features", "flags", "toggle", "beta" → template://json/feature-flags
     * "hero", "banner", "config" → template://json/hero-config
     * "pricing", "plans", "tiers", "subscription" → template://json/pricing-data
     * "personalization", "targeting", "offers" → template://json/personalization-content

2. IF TEMPLATE FOUND:
   a) Read the template using MCP Resource (e.g., template://json/feature-flags)
   b) Parse the template JSON to get name, description, content, and variables
   c) Show template to user: "I found a '{name}' template: {description}. Would you like to use it as a starting point, or would you prefer I create custom JSON?"
   d) If user chooses template:
      - Ask user for required variable values (marked as required: true in template)
      - Ask about optional variables (show defaults from template)
      - Replace all {{VARIABLE}} placeholders in content with user's values
      - Convert the content to proper JSON (replace string placeholders with actual values)
      - Show the populated JSON to user
      - Ask: "Does this look good? Should I create this offer in Target?"
      - If yes: Call createJsonOffer tool with the populated JSON content
   e) If user prefers custom JSON:
      - Continue to WORKFLOW section below

3. IF NO TEMPLATE FOUND:
   - Continue to WORKFLOW section below

IMPORTANT NOTES ABOUT JSON TEMPLATES:
- Templates provide structured, tested JSON schemas for common use cases
- Templates ensure consistent data structure across offers
- You can modify template JSON after populating variables if user requests changes
- Templates are located in src/templates/json/
- Each template has a variables array defining what needs to be replaced
- Variable replacement in JSON templates:
  * String values: {{VARIABLE}} → "user value"
  * Number values: {{VARIABLE}} → 123 (no quotes)
  * Boolean values: {{VARIABLE}} → true/false (no quotes)
  * Arrays: Keep JSON array structure, replace individual items

===============================================================================

USAGE:
JSON offers allow you to return structured data instead of HTML. The content should be a valid JSON object that your application can consume.

WORKFLOW (if not using templates):
1. Define your JSON structure (e.g., product data, configuration, feature flags)
2. Create the offer with this tool
3. Use the returned offer ID in your Target activity
4. Your application receives the JSON when the activity fires

CONTENT RULES:
- NEVER include emojis in JSON content, property values, or any part of the offer
- Keep all text values professional and emoji-free
- Use plain text only for all content

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
