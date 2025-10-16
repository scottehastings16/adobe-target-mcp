# Adobe Target Content Templates

This directory contains pre-built templates for common Adobe Target use cases. Templates allow you to quickly create offers with best practices built-in.

## Directory Structure

```
templates/
├── html/          # HTML offer templates (DOM modifications, visual changes)
│   ├── carousel.json
│   ├── hero-banner.json
│   ├── cta-button.json
│   ├── modal.json
│   ├── sticky-header.json
│   └── countdown-timer.json
│
└── json/          # JSON offer templates (SPAs, headless experiences)
    ├── product-recommendations.json
    ├── feature-flags.json
    ├── hero-config.json
    ├── pricing-data.json
    └── personalization-content.json
```

## Available Templates

### HTML Templates

| Template | Description | Use Cases |
|----------|-------------|-----------|
| **carousel** | Responsive image carousel with navigation | Product galleries, hero sections, testimonials |
| **hero-banner** | Full-width hero with CTA | Landing pages, homepage banners |
| **cta-button** | Styled CTA button | Button tests, conversion optimization |
| **modal** | Popup/overlay with triggers | Promotions, announcements, lead capture |
| **sticky-header** | Fixed banner (top/bottom) | Announcements, promotions, notifications |
| **countdown-timer** | Urgency timer | Sales, limited-time offers, events |

### JSON Templates

| Template | Description | Use Cases |
|----------|-------------|-----------|
| **product-recommendations** | Product catalog data | E-commerce, recommendations, merchandising |
| **feature-flags** | Feature toggle configuration | Feature rollouts, beta testing, A/B tests |
| **hero-config** | Hero section data | SPAs, headless CMS, dynamic content |
| **pricing-data** | Pricing plans/tiers | Pricing tests, subscription offers |
| **personalization-content** | Personalized messaging | Audience targeting, dynamic content |

## How to Use Templates

### 1. User Requests Content

When a user asks to create content (e.g., "Create a carousel"), the LLM will:
1. Search `templates/html/` or `templates/json/` for matching templates
2. Show the template name and description
3. Ask if the user wants to use it
4. Collect variable values from the user
5. Populate the template
6. Create the offer in Adobe Target

### 2. Template Selection

Templates are matched based on:
- **Filename**: `carousel.json` matches "carousel", "slider", "gallery"
- **Tags**: Each template has searchable tags
- **Description**: LLM uses semantic matching

### 3. Variable Replacement

Each template has variables in `{{VARIABLE_NAME}}` format:

```javascript
// Template content:
"heading": "{{HEADING}}",
"price": "{{PRICE}}"

// User provides:
HEADING = "Special Offer"
PRICE = "29.99"

// Result:
"heading": "Special Offer",
"price": "29.99"
```

## Template File Format

Each template is a JSON file with this structure:

```json
{
  "name": "Template Display Name",
  "type": "html" or "json",
  "description": "What this template does",
  "tags": ["searchable", "keywords"],
  "content": "The actual template content with {{VARIABLES}}",
  "variables": [
    {
      "name": "{{VARIABLE_NAME}}",
      "description": "What this variable is",
      "example": "Example value",
      "required": true/false,
      "default": "Default value if not provided",
      "options": ["option1", "option2"]  // Optional: for dropdowns
    }
  ],
  "notes": "Additional information (optional)"
}
```

## Creating New Templates

### Step 1: Choose Template Type

- **HTML Template**: For DOM modifications, visual changes, JavaScript code
  - Save in `templates/html/`
  - Use ES5 JavaScript only (no arrow functions, backticks, const/let)
  - Wrap code in IIFE: `(function() { ... })()`
  - Inject CSS via JavaScript (no standalone `<style>` tags)
  - Make responsive with media queries

- **JSON Template**: For SPAs, headless experiences, structured data
  - Save in `templates/json/`
  - Use valid JSON structure
  - Content can be nested objects/arrays

### Step 2: Write the Template

**HTML Example:**
```json
{
  "name": "Custom Banner",
  "type": "html",
  "description": "A simple banner with message",
  "tags": ["banner", "message", "notification"],
  "content": "<script>\n(function() {\n  var banner = document.querySelector('{{SELECTOR}}');\n  if (banner) {\n    banner.textContent = '{{MESSAGE}}';\n    banner.style.backgroundColor = '{{COLOR}}';\n  }\n})();\n</script>",
  "variables": [
    {
      "name": "{{SELECTOR}}",
      "description": "CSS selector for banner element",
      "example": "#banner",
      "required": true
    },
    {
      "name": "{{MESSAGE}}",
      "description": "Banner message text",
      "example": "Welcome!",
      "required": true
    },
    {
      "name": "{{COLOR}}",
      "description": "Background color",
      "example": "#007bff",
      "required": false,
      "default": "#007bff"
    }
  ]
}
```

**JSON Example:**
```json
{
  "name": "Simple Config",
  "type": "json",
  "description": "Basic configuration data",
  "tags": ["config", "settings"],
  "content": {
    "title": "{{TITLE}}",
    "enabled": {{ENABLED}},
    "items": [
      "{{ITEM_1}}",
      "{{ITEM_2}}"
    ]
  },
  "variables": [
    {
      "name": "{{TITLE}}",
      "description": "Configuration title",
      "example": "My Config",
      "required": true
    },
    {
      "name": "{{ENABLED}}",
      "description": "Enable feature (true/false)",
      "example": "true",
      "required": false,
      "default": "false"
    },
    {
      "name": "{{ITEM_1}}",
      "description": "First item",
      "example": "Item A",
      "required": true
    },
    {
      "name": "{{ITEM_2}}",
      "description": "Second item",
      "example": "Item B",
      "required": false,
      "default": ""
    }
  ]
}
```

### Step 3: Test the Template

1. Ask the LLM to use your template
2. Provide test variable values
3. Verify the output looks correct
4. Test in Adobe Target (create offer, add to activity)

### Step 4: Add Good Tags

Tags help the LLM find your template:

```json
"tags": ["carousel", "slider", "gallery", "images", "swipe", "navigation", "responsive"]
```

**Good tag examples:**
- Functionality: "carousel", "modal", "banner"
- Use case: "promotion", "announcement", "urgency"
- Content type: "product", "pricing", "feature"
- Target audience: "ecommerce", "saas", "media"

## Template Best Practices

### HTML Templates

1. **ES5 Compatibility** (Adobe Target requirement)
   - NO: `const button = document.querySelector('.btn')`
   - YES: `var button = document.querySelector('.btn')`
   - NO: `onClick={() => console.log('clicked')}`
   - YES: `addEventListener('click', function() { console.log('clicked'); })`
   - NO: `` `Hello ${name}` ``
   - YES: `'Hello ' + name`

2. **Prevent Variable Collisions**
   - Always wrap in IIFE: `(function() { ... })()`
   - Use local `var` inside IIFE
   - For globals: `window.at_variableName`

3. **CSS Injection**
   - NO: Standalone `<style>` tags don't work
   - YES: Inject via JavaScript:
     ```javascript
     var style = document.createElement('style');
     style.textContent = '.my-class { color: red; }';
     document.head.appendChild(style);
     ```
   - YES: Or use inline styles:
     ```javascript
     element.style.color = 'red';
     ```

4. **Responsive Design**
   - Use media queries in injected CSS
   - Test mobile (375px) and desktop (1920px)
   - Default to mobile-first

5. **Defensive Coding**
   - Check if elements exist: `if (element) { ... }`
   - Fail gracefully (no errors)
   - Don't break existing page functionality

6. **No Emojis**
   - Never use emojis in templates
   - Keep all content professional and text-only

### JSON Templates

1. **Valid JSON**
   - Test with JSON validator
   - Use proper escaping for special characters

2. **Meaningful Structure**
   - Group related fields
   - Use nested objects for organization
   - Keep it flat when possible

3. **Clear Variable Names**
   - Descriptive: `{{PRODUCT_NAME}}` not `{{P1}}`
   - Consistent: `{{BUTTON_COLOR}}` and `{{TEXT_COLOR}}`, not `{{BTN_COLOR}}` and `{{TEXT_COLOUR}}`
   - Scoped: `{{PRODUCT_1_NAME}}` for multiple products

4. **Provide Defaults**
   - Set sensible defaults for optional fields
   - Makes templates easier to use

## Filesystem MCP Integration

The LLM uses the filesystem MCP to:
1. List available templates: `list templates/html/`
2. Read template files: `read templates/html/carousel.json`
3. Search by tags: Filename and tag matching
4. Display options to user
5. Populate variables and create offer

## Support

For questions or issues with templates:
- Check the main README in `mcp-server/`
- Review Adobe Target coding rules in `tools/offers/createOffer.js`
- Test templates in Target UI before deploying
