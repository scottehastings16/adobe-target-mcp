/**
 * List Templates Tool
 * Browse available HTML and JSON offer templates via MCP resources
 */

export const tool = {
  name: 'listTemplates',
  description: `List all available offer templates (HTML and JSON).

This tool informs users that templates are available as MCP resources.

WHEN TO USE THIS TOOL:
- User asks: "What templates are available?"
- User asks: "Do you have a template for X?"
- User wants to browse templates before creating an offer
- User is unsure what to create and wants ideas

TEMPLATE TYPES:
- HTML Templates: For DOM modifications, visual changes, JavaScript code
- JSON Templates: For SPAs, headless experiences, structured data

Templates are exposed as MCP resources with URIs like:
- template://html/carousel
- template://json/feature-flags

Use the MCP List Resources command to see all available templates.
Use the MCP Read Resource command with the template URI to read a template.`,
  inputSchema: {
    type: 'object',
    properties: {}
  }
};

export async function handler(args, context) {
  return {
    message: "Templates are available as MCP resources!",
    instructions: [
      "1. Templates are now exposed as MCP resources with URIs like:",
      "   - template://html/carousel",
      "   - template://html/hero-banner",
      "   - template://json/feature-flags",
      "   - template://json/product-recommendations",
      "",
      "2. To see all available templates:",
      "   Use the MCP 'List Resources' feature (not a tool call)",
      "",
      "3. To read a template:",
      "   Use the MCP 'Read Resource' feature with the template URI",
      "",
      "4. Templates available:",
      "   - HTML: accordion, carousel, countdown-timer, cta-button, form-field,",
      "           hero-banner, modal, notification-banner, sticky-header, tabs",
      "   - JSON: ab-test-variant, feature-flags, form-config, hero-config,",
      "           navigation-menu, personalization-content, pricing-data,",
      "           product-recommendations, testimonials"
    ].join('\n'),
    totalTemplates: 19,
    htmlTemplates: 10,
    jsonTemplates: 9,
    howToUse: "Claude will automatically access these templates as MCP resources when needed"
  };
}
