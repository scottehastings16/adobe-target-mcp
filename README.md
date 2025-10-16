# Adobe Target MCP Agent

**Version 2.2.0**

The (**Unofficial**) Model Context Protocol Agent for Adobe Target, enabling your favorite MCP Clients to create and manage Target activities, content creation, offers, audiences, and automated dataLayer event generation.

**MCP Standard Compliance:** This project follows the open Model Context Protocol standard and works with any MCP-compatible client (Claude Desktop, Cursor, or other MCP clients). Configuration examples below use Claude Desktop/Code, but the same `mcpServers` format applies to all MCP clients.

This is an experimental MCP agent under active development. While tested and functional, some features are still being refined. Contributions, forks, and customizations are encouraged.

**⚠️Important:** This project is not affiliated with, endorsed by, or sponsored by Adobe Systems Incorporated. This is an unofficial, independent integration using Adobe Target's publically documented APIs. This agent interacts with AI services and your Adobe Target account. Be mindful of the risks when using AI agents for commercial work, including potential exposure of sensitive data to AI providers. You are solely responsible for reviewing all code, managing API credentials securely, and ensuring compliance with your organization's policies. Use at your own risk - the author assumes no liability for data exposure, account issues, or business impacts.

---

## Table of Contents

- [Features](#features)
- [Important: API Activity Limitations](#important-api-activity-limitations)
- [Quick Start](#quick-start)
- [Dependencies](#dependencies)
- [Project Structure](#project-structure)
- [Template System](#template-system)
- [Available Tools (34 total)](#available-tools-34-total)
- [Configuration Files](#configuration-files)
- [Code Generation Rules](#code-generation-rules)
- [DataLayer Event Tracking](#datalayer-event-tracking)
- [Working with Chrome DevTools MCP](#working-with-chrome-devtools-mcp)
- [Recommended Workflow](#recommended-workflow)
- [Example Workflows](#example-workflows)
- [Customization & Extensibility](#customization--extensibility)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Links](#links)
- [Version History](#version-history)

---

## Features

### Core Capabilities
- **Adobe Target Admin API Integration**: 34 tools for activities, offers, audiences, reports, and resources
- **19 Pre-Built Templates**: Ready-to-use HTML & JSON templates for common use cases (Customizeable)
- **Template System**: Automatic template matching, variable population, and customization
- **Intelligent DataLayer Event Generation**: Automated conversion tracking for GTM, Adobe Launch, Tealium, Segment
- **Configurable Conversion Event Firing Conditions**: Session-based, throttled, debounced, and persistent event tracking
- **Default Configuration System**: Pre-configure mboxes, priorities, A4T settings for consistent deployments
- **Live Page Access via Chrome DevTools MCP**: Direct DOM queries without context bloat

### Code Generation
- **ES5-Compatible Code Generation**: All generated code works in legacy browsers (no ES6+ features)
- **Responsive Design Support**: Auto-generates mobile and desktop CSS with media queries
- **Variable Collision Prevention**: IIFE wrapping, proper scoping, `at_` prefix for globals
- **Defensive Coding**: Element existence checks, graceful failures

### Integration Requirements
- **Live Browser Integration**: Requires Chrome DevTools MCP for DOM analysis and page preview
- **File System Access**: Requires Filesystem MCP for reading/writing project files

---

## Important: API Activity Limitations

> [!WARNING]
> **Activities created via the Admin API CANNOT be edited in the Adobe Target UI.** This is an Adobe Target platform restriction.

**Recommended Content Creation Workflow:**
1. Create offers via API (fully editable in UI)
2. Build activities manually in Target UI using those offers

> [!TIP]
> This approach gives you the best of both worlds: AI-generated code + full UI editing capabilities.

---

## Quick Start

### Prerequisites

Before installing, ensure you have:
- **Node.js 20+** - Required for ES modules support ([Download](https://nodejs.org/))
- **Chrome Browser** - Required for the agent to see your webpage, analyze DOM elements, and preview changes live
- **Adobe Target Account** - With Admin API access
- **MCP Client** - Claude Desktop, Claude Code, Cursor, Windsurf or any MCP-compatible client

### 1. Clone the Repository

```bash
git clone https://github.com/scottehastings16/adobe-target-mcp-agent.git
cd adobe-target-mcp-agent
```
### 2. Install Dependencies

```bash
npm install
```

**Dependencies installed:**
- `@modelcontextprotocol/sdk@^1.0.4` - MCP protocol implementation
- `dotenv@^17.2.3` - Environment variable management

### 3. Install Required MCP Servers

This agent requires **two MCP servers** working together:

#### a) Adobe Target MCP Agent (this project)
- Already installed with `npm install`

#### b) Chrome DevTools MCP Server (REQUIRED)
- Provides live browser DOM access and page analysis
- Automatically installed via `npx` when adobe-target-mcp-agent is configured
- Requires Chrome or Chromium browser


**Install Chrome Browser:**
```bash
# You ONLY need Chrome browser installed
# The chrome-devtools-mcp package is auto-installed by npx

# Windows: Download from https://www.google.com/chrome/
# Mac: brew install --cask google-chrome
# Linux: sudo apt install google-chrome-stable
```

> [!NOTE]
> **Important Notes:**
> - **No Puppeteer installation needed** - chrome-devtools-mcp handles all dependencies automatically
> - **First run** - `npx` will download and cache chrome-devtools-mcp (~20-30 seconds)
> - **Chromium download** - If chrome-devtools-mcp uses Puppeteer internally, it may download Chromium (~300MB) on first run UNLESS you set `CHROME_PATH` to use your existing Chrome installation
> - **Subsequent runs** - Much faster after initial cache/download

### 4. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
# Required - Adobe Target API credentials
TARGET_TENANT_ID=your-tenant-id
TARGET_API_KEY=your-api-key
TARGET_ACCESS_TOKEN=your-access-token
TARGET_WORKSPACE_ID=your-workspace-id

# Optional - Default values for activities
TARGET_DEFAULT_MBOXES=target-global-mbox
TARGET_DEFAULT_PRIORITY=5

# Optional - Analytics for Target (A4T) integration - This integration has not been set up or tested.
TARGET_A4T_DATA_COLLECTION_HOST=company.sc.omtrdc.net
TARGET_A4T_COMPANY_NAME=YourCompany
TARGET_A4T_REPORT_SUITES=prod-rsid

# Optional - Success metrics defaults
TARGET_DEFAULT_METRIC_TYPE=engagement
TARGET_DEFAULT_ENGAGEMENT_METRIC=page_count
```

### 5. Configure MCP Client

Copy `.claude.json.example` to your MCP client's configuration file and update the paths and credentials.

**For Claude Desktop/Code:**

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

**For other MCP clients:** Refer to your client's documentation for the MCP server configuration file location.

```json
{
  "mcpServers": {
    "adobe-target": {
      "command": "node",
      "args": ["C:\\Users\\YourUsername\\adobe-target-mcp-agent\\mcp-server\\index.js"],
      "env": {
        "TARGET_TENANT_ID": "your-tenant-id",
        "TARGET_API_KEY": "your-api-key",
        "TARGET_ACCESS_TOKEN": "your-access-token",
        "TARGET_WORKSPACE_ID": "your-workspace-id",
        "TARGET_DEFAULT_MBOXES": "target-global-mbox",
        "TARGET_DEFAULT_PRIORITY": "5"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      }
    }
  }
}
```

**Platform-specific Chrome paths:**
- **Windows:** `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`
- **Mac:** `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`
- **Linux:** `"/usr/bin/google-chrome"` or `"/usr/bin/chromium"`

**Platform-specific path formats:**
- **Windows:** Use backslashes with escaping: `"C:\\Users\\YourUsername\\adobe-target-mcp-agent\\..."`
- **Mac/Linux:** Use forward slashes: `"/Users/yourname/adobe-target-mcp-agent/..."`

### 6. Start Using

Once configured, you can ask your AI assistant to:
- "Create a carousel under the hero image on my website www.example.com"
- "Show me what response tokens are avilable in my targt propert"
- "Generate a popup module for my page www.example.com, add a CTA and this image: example.com/image.png... add a CTA that links to the products page at this link example.com/products"
- "Create a JSON offer for feature flags"
- "List all active Target activities"
- "List avilable mboxes in my property"
- "Generate a conversion report for the Buy Now CTA Test"
- Show me avilable OOTB templates
- Help me create a new response token
- Update the "Buy Now" Offer with a new stlying using by configured brand colors

The agent will use its 34 tools and 19 templates to interact with Adobe Target on your behalf.

---

## Dependencies

### Runtime Dependencies

```json
{
  "@modelcontextprotocol/sdk": "^1.0.4",  // MCP protocol SDK
  "dotenv": "^17.2.3"                     // Environment configuration
}
```

### Required External MCP Servers

1. **chrome-devtools-mcp** (auto-installed via npx)
   - Purpose: Live browser control, DOM analysis, screenshots
   - Installation: Automatic on first run via `npx -y chrome-devtools-mcp`
   - Requirements: Chrome/Chromium browser

2. **@modelcontextprotocol/server-filesystem** (auto-installed via npx)
   - Purpose: File system read/write operations
   - Installation: Automatic on first run via `npx -y @modelcontextprotocol/server-filesystem`
   - Security: Scoped to specified directory only

### Development Dependencies

```json
{
  "@types/node": "^20.10.0"  // TypeScript definitions for Node.js
}
```

### System Requirements

- **Node.js**: 20+ (ES modules support required)
- **Adobe Target**: Account with Admin API access
- **Chrome Browser**: Required for Chrome DevTools MCP integration
- **MCP Client**: Claude Desktop, Claude Code, or any MCP-compatible client

---

## Project Structure

```
adobe-target-mcp-agent/
├── mcp-server/
│   ├── index.js                        # Main MCP server entry point
│   ├── .env.example                    # Environment variable template
│   │
│   ├── config/
│   │   ├── tag-managers.json           # Tag manager configurations (GTM, Adobe Launch, Tealium, Segment)
│   │   ├── firing-conditions.json      # Event firing logic (session, throttle, debounce, etc.)
│   │   └── brand-styles.json           # Brand style guidelines and design system configurations
│   │
│   ├── helpers/
│   │   ├── makeTargetRequest.js        # Adobe Target API client wrapper
│   │   └── applyDefaults.js            # Auto-fill default configuration values
│   │
│   ├── templates/
│   │   ├── README.md                   # Template system documentation
│   │   ├── html/                       # HTML offer templates (10 templates)
│   │   │   ├── carousel.json
│   │   │   ├── hero-banner.json
│   │   │   ├── cta-button.json
│   │   │   ├── modal.json
│   │   │   ├── sticky-header.json
│   │   │   ├── countdown-timer.json
│   │   │   ├── form-field.json
│   │   │   ├── tabs.json
│   │   │   ├── accordion.json
│   │   │   └── notification-banner.json
│   │   └── json/                       # JSON offer templates (9 templates)
│   │       ├── product-recommendations.json
│   │       ├── feature-flags.json
│   │       ├── hero-config.json
│   │       ├── pricing-data.json
│   │       ├── personalization-content.json
│   │       ├── navigation-menu.json
│   │       ├── form-config.json
│   │       ├── testimonials.json
│   │       └── ab-test-variant.json
│   │
│   └── tools/
│       ├── index.js                    # Tool registration
│       ├── activities/                 # Activity management (5 tools)
│       │   ├── listActivities.js
│       │   ├── createABActivity.js
│       │   ├── getABActivity.js
│       │   ├── updateABActivity.js
│       │   └── updateActivityState.js
│       ├── offers/                     # Offer management (5 tools)
│       │   ├── listOffers.js
│       │   ├── createOffer.js          # PRIMARY TOOL - HTML offers
│       │   ├── createJsonOffer.js      # JSON offers (SPAs, server-side, mobile)
│       │   ├── getOffer.js
│       │   └── updateOffer.js
│       ├── audiences/                  # Audience management (2 tools)
│       │   ├── listAudiences.js
│       │   └── createAudience.js
│       ├── mboxes/                     # Mbox resources (3 tools)
│       │   ├── listMboxes.js
│       │   ├── getMbox.js
│       │   └── listMboxProfileAttributes.js
│       ├── properties/                 # Properties (1 tool)
│       │   └── listProperties.js
│       ├── reports/                    # Reporting (6 tools)
│       │   ├── getABPerformanceReport.js
│       │   ├── getABOrdersReport.js
│       │   ├── getXTPerformanceReport.js
│       │   ├── getXTOrdersReport.js
│       │   ├── getAPTPerformanceReport.js
│       │   └── getActivityInsights.js
│       ├── response-tokens/            # Response tokens (2 tools)
│       │   ├── listResponseTokens.js
│       │   └── createResponseToken.js
│       ├── atjs/                       # at.js settings (2 tools)
│       │   ├── getAtjsSettings.js
│       │   └── getAtjsVersions.js
│       ├── revisions/                  # Activity revisions (2 tools)
│       │   ├── getRevisions.js
│       │   └── getEntityRevisions.js
│       ├── templates/                  # Template management (1 tool)
│       │   └── listTemplates.js        # Browse available templates
│       └── custom/                     # DataLayer & preview tools (5 tools)
│           ├── generateDataLayerEvent.js
│           ├── extractPageManually.js     # Manual fallback (last resort)
│           ├── createActivityFromModifications.js
│           ├── generatePreviewScript.js
│           └── getMockupAnalysisInstructions.js
│
├── package.json                        # Node.js dependencies
├── .env                                # Environment variables (create from .env.example)
└── README.md                           # This file
```

---

## Template System

### Overview

The template system provides 19 pre-built, templates for common Adobe Target use cases. Templates automatically follow all of the Agent's Adobe Target rules (ES5, IIFE, responsive design, defensive coding, no emojis).

### Available Templates (Customizeable)

#### HTML Templates (10 total)

| Template | Description | Use Cases |
|----------|-------------|-----------|
| **carousel** | Responsive image carousel with navigation, dots, auto-play, mobile swipe | Product galleries, hero sections, testimonials |
| **hero-banner** | Full-width hero with heading, subheading, CTA, background image | Landing pages, homepage banners |
| **cta-button** | Styled CTA button with hover effects | Button tests, conversion optimization |
| **modal** | Popup/overlay with multiple triggers (load, scroll, exit intent) | Promotions, announcements, lead capture |
| **sticky-header** | Fixed announcement banner (top/bottom) | Announcements, promotions, notifications |
| **countdown-timer** | Real-time countdown timer | Sales, limited-time offers, events |
| **form-field** | Form field styling and validation | Form optimization tests |
| **tabs** | Tabbed interface (2-3 tabs) | Content organization, product features |
| **accordion** | Collapsible FAQ/sections (2-4 items) | FAQs, product details |
| **notification-banner** | Dismissible notification alerts | Info, success, warning, error messages |

#### JSON Templates (9 total)

| Template | Description | Use Cases |
|----------|-------------|-----------|
| **product-recommendations** | Product catalog with pricing, images, badges | E-commerce, merchandising |
| **feature-flags** | Feature toggle configuration | Beta rollouts, A/B feature tests |
| **hero-config** | Hero section data for SPAs | Headless CMS, dynamic content |
| **pricing-data** | Pricing plans/tiers (3 plans) | Pricing page tests, subscription offers |
| **personalization-content** | Personalized messaging with offers | Audience targeting, dynamic content |
| **navigation-menu** | Navigation structure (4 items, nested) | Header menu tests, navigation changes |
| **form-config** | Dynamic form configuration (4 fields) | Form optimization, field testing |
| **testimonials** | Customer reviews/testimonials (3 reviews) | Social proof, trust building |
| **ab-test-variant** | Simple A/B test variant data | Quick SPA tests, variant configs |

### How Templates Work

1. **Automatic Discovery**: When you request content (e.g., "Create a carousel"), the agent automatically searches for matching templates
2. **Customizeable**: Create your own template for frequently used content to speed up personalization efforts
3. **Template Selection**: Matches templates by filename, tags, and description
4. **Variable Population**: Agent asks for required values and populates template variables
5. **Code Generation**: Template generates production-ready code
6. **Offer Creation**: Creates offer in Adobe Target

### Using Templates

**Example: Create Carousel**

```
User: "Create a carousel for my homepage"

Agent:
1. Searches templates/html/ for "carousel"
2. Finds carousel.json template
3. Shows: "I found a 'Responsive Carousel' template. Would you like to use it?"
4. User: "Yes"
5. Agent asks for:
   - Where should it appear? → #hero-carousel
   - What images? → img1.jpg,img2.jpg,img3.jpg
   - Auto-play? → true
6. Agent populates template and shows code
7. Creates offer in Adobe Target
8. Returns offer ID and instructions
```

### Browse Templates

```
User: "What templates are available?"

Agent calls listTemplates tool and shows:
- 10 HTML templates
- 9 JSON templates
- Names, descriptions, variables for each
```

### Template Features

Every template includes:
- **ES5 compatible** (no arrow functions, backticks, const/let)
- **IIFE wrapped** (prevents variable collisions)
- **Responsive** (mobile and desktop support with media queries)
- **Defensive coding** (checks if elements exist)
- **No emojis** (professional content only)
- **CSS injection** (via JavaScript, not standalone `<style>` tags)
- **Configurable variables** (customize for your needs)
- **Default values** (sensible defaults for optional fields)

---

## Available Tools (34 total)

### Activities (5 tools)
- `listActivities` - List all Target activities with filtering
- `createABActivity` - Create A/B test (API-only, advanced use)
- `getABActivity` - Get activity details by ID
- `updateABActivity` - Update activity configuration
- `updateActivityState` - Activate, pause, or deactivate activities

### Offers (5 tools)
- `listOffers` - List all offers with filtering
- `createOffer` - **PRIMARY TOOL** - Create HTML offer (use for 95% of cases)
- `createJsonOffer` - Create JSON offer for SPAs, server-side, mobile apps, headless
- `getOffer` - Get offer details by ID
- `updateOffer` - Update offer content

### Audiences (2 tools)
- `listAudiences` - List all audiences
- `createAudience` - Create new audience with rules

### Mboxes (3 tools)
- `listMboxes` - List all mboxes
- `getMbox` - Get mbox details
- `listMboxProfileAttributes` - List profile attributes for mbox

### Properties (1 tool)
- `listProperties` - List Target properties

### Reports (6 tools)
- `getABPerformanceReport` - A/B test performance metrics
- `getABOrdersReport` - A/B test order/revenue data
- `getXTPerformanceReport` - Experience Targeting performance
- `getXTOrdersReport` - Experience Targeting orders
- `getAPTPerformanceReport` - Automated Personalization performance
- `getActivityInsights` - Activity insights and recommendations

### Response Tokens (2 tools)
- `listResponseTokens` - List all response tokens
- `createResponseToken` - Create custom response token

### at.js Configuration (2 tools)
- `getAtjsSettings` - Get at.js settings
- `getAtjsVersions` - List available at.js versions

### Revisions (2 tools)
- `getRevisions` - List all activity revisions
- `getEntityRevisions` - Get revisions for specific entity

### Templates (1 tool)
- `listTemplates` - **Browse all available HTML & JSON templates**

### Custom Tools (5 tools)
- `generateDataLayerEvent` - **Generate conversion tracking code** with tag manager support
- `extractPageManually` - Manual fallback instructions (last resort if automation fails)
- `createActivityFromModifications` - Create Target activity from JavaScript modifications (advanced use, API limitations apply)
- `generatePreviewScript` - Generate preview script for Chrome DevTools MCP injection
- `getMockupAnalysisInstructions` - Get instructions for mockup analysis and experience generation workflow

---

## Configuration Files

### tag-managers.json

Defines event structures for multiple tag management platforms.

**Supported Tag Managers:**
- **gtm**: Google Tag Manager (`dataLayer.push`)
- **adobeLaunch**: Adobe Experience Platform Tags (`_satellite.track`)
- **tealium**: Tealium iQ (`utag.link`)
- **segment**: Segment Analytics (`analytics.track`)
- **customDataLayer**: Custom implementations

**Example:**
```json
{
  "gtm": {
    "eventObject": "window.dataLayer",
    "method": "push",
    "eventStructure": {
      "eventKey": "event",
      "activityKey": "at_activity",
      "experienceKey": "at_experience",
      "defaultEventName": "target_conversion"
    }
  }
}
```

### firing-conditions.json

Defines when and how conversion events should fire.

**Available Conditions:**

| Condition | Use Case | Implementation |
|-----------|----------|----------------|
| `always` | Track every interaction | No limit |
| `once_per_session` | **Conversions** (recommended) | sessionStorage |
| `once_per_page` | Single-page apps, prevent double-clicks | Flag variable |
| `once_ever` | First-time actions, onboarding | localStorage |
| `throttle` | Scroll, hover, high-frequency events | Timer (configurable interval) |
| `debounce` | Search input, form fields | Timer (configurable delay) |

---

## Code Generation Rules

All generated code follows strict rules for Adobe Target compatibility:

### ES5 Only (No ES6+)
- No template literals - Use: `'Hello ' + name`
- No arrow functions - Use: `function() {}`
- No `const`/`let` - Use: `var` only
- No destructuring, spread operators, or other ES6+ features

### Variable Safety
- Wrap in IIFE: `(function() { ... })()`
- Use local `var` inside IIFE
- For globals: `window.at_variableName = value;`
- Never: bare `var` at top level

### DOM & Performance
- Defensive coding: `if (element) { ... }`
- Cache selectors: `var button = document.querySelector('.cta')`
- No polling/setInterval
- Elements exist when Target fires

### Styling
- Prefix new classes with `at-` (e.g., `at-hero-banner`, `at-cta-button`)
- Inject CSS via JavaScript into `<head>`
- Use inline styles for specificity
- Responsive design with media queries

### Responsive Design
```javascript
// Inject responsive CSS
var style = document.createElement('style');
style.textContent = '' +
  '.at-hero-banner { font-size: 18px; padding: 10px; }' +
  '@media (min-width: 768px) {' +
  '  .at-hero-banner { font-size: 24px; padding: 20px; }' +
  '}';
document.head.appendChild(style);
```

---

## DataLayer Event Tracking

### Automated Conversion Tracking

The `generateDataLayerEvent` tool creates ES5-compatible event listeners for conversion tracking.

**Workflow:**

1. User asks: "Create a CTA button test"
2. Agent generates offer code with button modifications
3. Agent asks: "Which tag manager?" (default: GTM)
4. Agent asks: "When to fire event?" (default: once per session)
5. Agent calls `generateDataLayerEvent`
6. Agent includes tracking code in offer

**Example:**

```javascript
// Generated tracking code
var element = document.querySelector('#signup-button');
if (element) {
  element.addEventListener('click', function() {
    var sessionKey = 'target_fired_Homepage_Signup_Test_signup_button';
    if (!sessionStorage.getItem(sessionKey)) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'target_conversion',
        at_activity: 'Homepage Signup Test',
        at_experience: 'Variant A'
      });
      sessionStorage.setItem(sessionKey, 'true');
    }
  });
}
```

---

## Working with Chrome DevTools MCP

### Direct Live Page Access

Chrome DevTools MCP provides **direct access to live pages** in the browser, eliminating the need for complex page extraction workflows.

### Workflow

**Query on Demand:**
```
User: "Analyze the homepage at https://example.com and add a banner"

Agent:
1. Uses Chrome DevTools MCP to navigate to https://example.com
2. Queries specific elements as needed:
   - document.querySelector('#hero-section') - Check if element exists
   - document.querySelector('#hero-section').outerHTML - Get specific HTML
   - document.querySelectorAll('.cta-button') - Find all CTAs
3. Generates Target modification code
4. Creates offer in Adobe Target

No extraction needed - just direct queries!
```

**Why This Works:**
- Chrome DevTools has live access to the full DOM
- Query only what you need, when you need it
- No context bloat from storing full pages
- Results are always fresh and accurate

### Common Chrome DevTools Queries

```javascript
// Check if element exists
document.querySelector('#hero-section')

// Get element HTML
document.querySelector('#hero-section').outerHTML

// Find all buttons
document.querySelectorAll('button, .cta, [role="button"]')

// Get element hierarchy
(function() {
  var el = document.querySelector('#hero-section');
  var parents = [];
  while (el.parentElement) {
    el = el.parentElement;
    parents.push({
      tag: el.tagName,
      id: el.id,
      classes: Array.from(el.classList)
    });
  }
  return parents;
})()

// Get computed styles
window.getComputedStyle(document.querySelector('#cta-button'))
```

---

## Recommended Workflow

### For Normal Development (Recommended)

1. **Generate Offers via Agent**
   - Ask the agent to create HTML offers (or use templates)
   - Include conversion tracking with `generateDataLayerEvent`
   - Offers are created in Target and **fully editable in UI**

2. **Build Activities in Target UI**
   - Navigate to Adobe Target UI
   - Create A/B Test or Experience Targeting activity
   - Select API-created offers from library
   - Configure audience, goals, settings
   - Activate and monitor

**Benefits:**
- AI-generated, optimized code
- Pre-built templates for common use cases
- Full UI editing capabilities
- Visual Experience Composer (VEC) available
- QA mode and preview work normally

### For Programmatic/Bulk Operations

Use `createABActivity` for:
- Automated testing workflows (CI/CD)
- Bulk activity creation 
- Template-based deployments
- Activities that won't need UI editing

**Limitations:**
- Cannot edit in Target UI
- Cannot use VEC
- Can update via `updateABActivity` API
- Can activate/deactivate via `updateActivityState`

---
## Customization & Extensibility

This agent is designed to be customizable and extensible for your specific workflows and use cases. Here are the main ways to adapt it to your needs:

### 1. Adding Custom Templates

Create your own HTML or JSON templates for reusable components.

**Location:** `mcp-server/templates/html/` or `mcp-server/templates/json/`

**Template Structure:**
```json
{
  "name": "your-template-name",
  "description": "What this template does",
  "category": "html",
  "tags": ["keyword1", "keyword2"],
  "variables": [
    {
      "name": "selector",
      "description": "CSS selector for target element",
      "required": true
    }
  ],
  "template": "<!-- Your ES5-compatible code here -->"
}
```

**Best Practices:**
- Follow ES5 syntax (no arrow functions, const/let, template literals)
- Wrap code in IIFE to prevent variable collisions
- Include responsive design with media queries
- Add defensive checks for element existence
- Document all template variables clearly

### 2. Creating Custom Tools

Add new tools to extend the agent's capabilities for your specific Target workflows.

**Location:** `mcp-server/tools/custom/`

**Tool Structure:**
```javascript
export const tool = {
  name: 'yourCustomTool',
  description: 'What your tool does',
  inputSchema: {
    type: 'object',
    properties: {
      // Define your parameters
    },
    required: ['param1']
  }
};

export async function handler(args) {
  // Your tool logic here
  return {
    content: [{ type: 'text', text: 'Result' }]
  };
}
```

**Register Your Tool:**
Add it to `mcp-server/tools/index.js` to make it available to the agent.

### 3. Modifying Configuration Files

Customize the agent's behavior through configuration files:

#### tag-managers.json
Add support for custom tag management platforms:
```json
{
  "yourTagManager": {
    "eventObject": "window.yourDataLayer",
    "method": "track",
    "eventStructure": {
      "eventKey": "eventName",
      "activityKey": "targetActivity",
      "experienceKey": "targetExperience"
    }
  }
}
```

#### firing-conditions.json
Define custom event firing logic:
```json
{
  "your_condition": {
    "name": "Your Condition",
    "description": "When this fires",
    "implementation": "custom_flag",
    "code": "// Your ES5 firing logic"
  }
}
```

#### brand-styles.json
Add your organization's brand guidelines:
```json
{
  "yourBrand": {
    "name": "Your Brand Name",
    "colors": {
      "primary": { "main": "#000000" }
    },
    "typography": {
      "fontFamilies": {
        "primary": "'Your Font', sans-serif"
      }
    },
    "components": {
      "button": {
        "primary": {
          "backgroundColor": "#000000",
          "color": "#FFFFFF"
        }
      }
    }
  }
}
```

### 4. Integrating with Other MCP Servers

Combine this agent with other MCP servers for enhanced workflows.

**Integration Opprotunites:**
- **JIRA MCP** - Automate the full work flow from ticket creation, content creation and offer creation
- **Slack MCP** - Send notifications when activities are created/updated
- **Adobe Analytics MCP** - Pull data from analytics 

**Configuration Example:**
```json
{
  "mcpServers": {
    "adobe-target": { /* this agent */ },
    "database": { /* your database server */ },
    "slack": { /* slack integration */ }
  }
}
```

The agent can then coordinate across servers in multi-step workflows.

### 5. Custom DataLayer Implementations

Extend dataLayer event generation for custom tracking platforms.

**Add Custom Implementation:**
1. Add your platform to `tag-managers.json`
2. Define event structure and method calls
3. Update `generateDataLayerEvent` tool if custom logic needed

**Example Use Cases:**
- Custom analytics platforms
- Internal tracking systems
- Cross-domain event synchronization
- Server-side tracking endpoints

### 6. Creating Workflow-Specific Helper Functions

Add utility functions for common operations in your workflow.

**Location:** `mcp-server/helpers/`

**Example Helpers:**
- **Batch operations** - Process multiple offers/activities at once
- **Content transformers** - Convert mockups to Target code
- **Validation utilities** - Check code against your standards
- **API wrappers** - Simplify complex Target API calls
- **Reporting helpers** - Format analytics data for dashboards

**Helper Structure:**
```javascript
export function yourHelper(params) {
  // Your utility logic
  return result;
}
```

### 7. Environment-Specific Configurations

Manage different configurations for dev/staging/production.

**Use Environment Variables:**
```bash
# .env.development
TARGET_WORKSPACE_ID=dev-workspace-id
TARGET_DEFAULT_PRIORITY=5

# .env.production
TARGET_WORKSPACE_ID=prod-workspace-id
TARGET_DEFAULT_PRIORITY=0
```

## Troubleshooting

### Authentication Errors
- Verify `TARGET_API_KEY` and `TARGET_ACCESS_TOKEN` are correct
- Check token hasn't expired (regenerate in Adobe Developer Console)

### Offers Not Appearing in Workspace
- Verify `TARGET_WORKSPACE_ID` matches your workspace (If not set it will be created in Default Workspace)
- Check workspace permissions for API user

### Conversion Events Not Firing
- Open browser console, check for JavaScript errors
- Verify tag manager object exists (`window.dataLayer`)
- Check firing condition behavior (session-based won't fire twice)
- Use tag manager debug mode 

### Code Not Working in Target
- Ensure code is ES5-compatible (no template literals)

### Templates Not Found
- Check templates exist in `mcp-server/templates/html/` and `mcp-server/templates/json/`
- Verify template files are valid JSON format
- Restart MCP server after adding new templates

---

## License

MIT License - See LICENSE file

---

## Links

- [Adobe Target Admin API Documentation](https://developer.adobe.com/target/administer/admin-api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [GitHub Repository](https://github.com/scottehastings16/adobe-target-mcp-agent)

---

## Version History

### 2.2.0 (Current)
- **Removed Obsolete Page Extraction Tools**: Deleted extractPageStructure, extractPageMinimal, queryPageStructure, getPageStructureSnippets
- **Simplified Workflow**: Use Chrome DevTools MCP for direct live page access
- **No Context Bloat**: Query only what you need, when you need it
- **Cleaner Documentation**: Removed outdated extraction workflow examples
- **Tool Count**: 34 total tools available

### 2.1.0
- **Template System**: Added 19 pre-built templates (10 HTML, 9 JSON)
- **Template Tool**: Added `listTemplates` tool for browsing templates
- **Automatic Template Matching**: AI automatically finds and suggests templates
- **Template Documentation**: Comprehensive README in templates folder
- **Updated Tool Descriptions**: Clear HTML vs JSON offer guidance
- **Enhanced JSON Offer Documentation**: Server-side, mobile, cross-channel use cases

### 2.0.0
- Removed JSDOM dependencies for lighter footprint
- Added DataLayer event generation with multiple tag manager support
- Added configurable firing conditions (session, throttle, debounce, etc.)
- Added default values system for consistent configurations
- Enhanced ES5 code generation with responsive design support
- Added 38 comprehensive tools for full Target API coverage
- Optimized workflow: Create offers via API → Build activities in UI

### 1.0.0
- Initial release with basic Target API integration
