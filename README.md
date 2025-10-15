# Adobe Target Admin API MCP Server

**Version 2.0.0**

The (**Unofficial**) Model Context Protocol server for Adobe Target, enabling AI agents to create and manage Target activities, content creation, offers, mboxes, audiences, at_properties, conversion reports, response tokens, revisions and conversion tracking with automated dataLayer event generation.

**MCP Standard Compliance:** This server follows the open Model Context Protocol standard and works with any MCP-compatible client (Claude Desktop, Cursor, or other MCP clients). Configuration examples below use Claude Desktop/Code, but the same `mcpServers` format applies to all MCP clients.

This is an experimental tool, and some features may be quirky. Feel free to fork and modify as you see fit.

## Critical: API Activity Limitations

**Activities created via the Admin API CANNOT be edited in the Adobe Target UI.** This is an Adobe Target platform restriction.
https://experienceleaguecommunities.adobe.com/t5/adobe-target-questions/target-admin-api-update-a-b-activity-api-does-not-make-the/td-p/423516

**Recommended workflow:**
1. Create offers via API (fully editable in UI)
2. Build activities manually in Target UI using those offers

This approach gives you the best of both worlds: AI-generated code + full UI editing capabilities.

## Features

- **Full Adobe Target API Integration**: Activities, offers, audiences, reports, and resources
- **Intelligent DataLayer Event Generation**: Automated conversion tracking for GTM, Adobe Launch, Tealium, Segment
- **Configurable Firing Conditions**: Session-based, throttled, debounced, and persistent event tracking
- **Default Configuration System**: Pre-configure mboxes, priorities, A4T settings for consistent deployments
- **ES5-Compatible Code Generation**: All generated code works in legacy browsers (no ES6+ features)
- **Responsive Design Support**: Auto-generates mobile and desktop CSS with media queries
- **Live Browser Integration**: Requires Chrome DevTools MCP for DOM analysis and page preview
- **File System Access**: Requires Filesystem MCP for reading/writing project files

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Required MCP Servers

This project requires three MCP servers working together:

**a) Adobe Target MCP Server** (this project)
- Already installed with `npm install`

**b) Chrome DevTools MCP Server** (REQUIRED)
- Provides live browser DOM access and page analysis
- Automatically installed via `npx` when configured
- Requires Chrome or Chromium browser

**c) Filesystem MCP Server** (REQUIRED)
- Provides file read/write capabilities
- Automatically installed via `npx` when configured

**Install Chrome Browser:**
```bash
# You ONLY need Chrome browser installed
# The chrome-devtools-mcp package is auto-installed by npx

# Windows: Download from https://www.google.com/chrome/
# Mac: brew install --cask google-chrome
# Linux: sudo apt install google-chrome-stable
```

**Important Notes:**
- **No Puppeteer installation needed** - chrome-devtools-mcp handles all dependencies automatically
- **First run** - `npx` will download and cache chrome-devtools-mcp (~20-30 seconds)
- **Chromium download** - If chrome-devtools-mcp uses Puppeteer internally, it may download Chromium (~300MB) on first run UNLESS you set `CHROME_PATH` to use your existing Chrome installation
- **Subsequent runs** - Much faster after initial cache/download

### 3. Configure Environment

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

# Optional - Analytics for Target (A4T) integration
TARGET_A4T_DATA_COLLECTION_HOST=company.sc.omtrdc.net
TARGET_A4T_COMPANY_NAME=Your Company
TARGET_A4T_REPORT_SUITES=prod-rsid

# Optional - Success metrics defaults
TARGET_DEFAULT_METRIC_TYPE=engagement
TARGET_DEFAULT_ENGAGEMENT_METRIC=page_count
```

### 4. Configure MCP Client

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
      "args": ["C:\\Users\\YourUsername\\at-cursor-extension\\mcp-server\\index.js"],
      "env": {
        "TARGET_TENANT_ID": "your-tenant-id",
        "TARGET_API_KEY": "your-api-key",
        "TARGET_ACCESS_TOKEN": "your-access-token",
        "TARGET_WORKSPACE_ID": "your-workspace-id",
        "TARGET_DEFAULT_MBOXES": "target-global-mbox",
        "TARGET_DEFAULT_PRIORITY": "5",
        "TARGET_A4T_DATA_COLLECTION_HOST": "company.sc.omtrdc.net",
        "TARGET_A4T_COMPANY_NAME": "Your Company",
        "TARGET_A4T_REPORT_SUITES": "prod-rsid"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\YourUsername\\at-cursor-extension"
      ]
    }
  }
}
```

**Platform-specific Chrome paths:**
- **Windows:** `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`
- **Mac:** `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`
- **Linux:** `"/usr/bin/google-chrome"` or `"/usr/bin/chromium"`

**Platform-specific path formats:**
- **Windows:** Use backslashes with escaping: `"C:\\Users\\YourUsername\\..."`
- **Mac/Linux:** Use forward slashes: `"/Users/yourname/..."`

### 5. Start Using

Once configured, you can ask your AI assistant to:
- "Create an HTML offer for a hero banner with a green CTA button"
- "Generate conversion tracking for my signup button using GTM"
- "List all active Target activities"
- "Create an audience for mobile users in California"

The AI will use the MCP tools to interact with Adobe Target on your behalf.

## Project Structure

```
├── mcp-server/
│   ├── index.js                    # Main MCP server
│   ├── .env.example                # Environment template
│   ├── config/
│   │   ├── tag-managers.json       # Tag manager configurations (GTM, Adobe Launch, Tealium, Segment)
│   │   └── firing-conditions.json  # Event firing logic (session, throttle, debounce, etc.)
│   ├── helpers/
│   │   ├── makeTargetRequest.js    # Adobe Target API client
│   │   └── applyDefaults.js        # Auto-fill default values
│   └── tools/
│       ├── activities/             # Activity management (6 tools)
│       ├── offers/                 # Offer management (4 tools)
│       ├── audiences/              # Audience management (2 tools)
│       ├── mboxes/                 # Mbox resources (3 tools)
│       ├── properties/             # Properties (1 tool)
│       ├── reports/                # Reporting (6 tools)
│       ├── response-tokens/        # Response tokens (2 tools)
│       ├── atjs/                   # at.js settings (2 tools)
│       ├── revisions/              # Activity revisions (2 tools)
│       └── custom/                 # DataLayer & preview tools (5 tools)
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Configuration Files

### tag-managers.json

Defines event structures for multiple tag management platforms. Each configuration includes:

- **eventObject**: The global object name (e.g., `window.dataLayer`, `_satellite`)
- **method**: The tracking method (e.g., `push`, `track`)
- **eventStructure**: Field names for event, activity, and experience
- **template**: ES5-compatible code template

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

Defines when and how conversion events should fire. Prevents duplicate tracking and optimizes performance.

**Available Conditions:**

| Condition | Use Case | Implementation |
|-----------|----------|----------------|
| `always` | Track every interaction | No limit |
| `once_per_session` | **Conversions** (recommended) | sessionStorage |
| `once_per_page` | Single-page apps, prevent double-clicks | Flag variable |
| `once_ever` | First-time actions, onboarding | localStorage |
| `throttle` | Scroll, hover, high-frequency events | Timer (configurable interval) |
| `debounce` | Search input, form fields | Timer (configurable delay) |

**Example:**
```json
{
  "firingConditions": {
    "once_per_session": {
      "name": "Once per session",
      "userDescription": "Fire only once per user session. Best for conversion tracking.",
      "implementation": "sessionStorage",
      "template": "var sessionKey = 'target_fired_{{UNIQUE_KEY}}';\nif (!sessionStorage.getItem(sessionKey)) {\n  {{TRACKING_CODE}}\n  sessionStorage.setItem(sessionKey, 'true');\n}"
    }
  }
}
```

**Adding Custom Conditions:**

1. Edit `mcp-server/config/firing-conditions.json`
2. Add new condition with template using placeholders: `{{TRACKING_CODE}}`, `{{UNIQUE_KEY}}`, `{{INTERVAL}}`, `{{DELAY}}`
3. Restart MCP server

## Available Tools (33 total)

### Activities (6 tools)
- `listActivities` - List all Target activities with filtering
- `createABActivity` - Create A/B test (API-only, advanced use)
- `getABActivity` - Get activity details by ID
- `updateABActivity` - Update activity configuration
- `updateActivityState` - Activate, pause, or deactivate activities
- `deleteABActivity` - Delete activity

### Offers (4 tools)
- `listOffers` - List all offers with filtering
- `createOffer` - **PRIMARY TOOL** - Create HTML/JSON offer with ES5 code
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

### Custom Tools (5 tools)
- `generateDataLayerEvent` - **Generate conversion tracking code** with tag manager support
- `extractDOMWithChromeDevTools` - Get live DOM snippets for analysis
- `createActivityFromModifications` - Generate activity JSON from modifications
- `sendPreviewToExtension` - Send preview to Chrome extension
- `preparePageForMockupComparison` - Prepare page for visual comparison

## DataLayer Event Tracking

### Automated Conversion Tracking

The `generateDataLayerEvent` tool creates ES5-compatible event listeners for conversion tracking.

**Workflow:**

1. User asks: "Create a CTA button test"
2. LLM generates offer code with button modifications
3. LLM asks: "Which tag manager are you using?" (default: GTM)
4. LLM asks: "When should the conversion event fire?" (default: once per session)
5. LLM calls `generateDataLayerEvent` with:
   - `selector`: CSS selector for conversion element
   - `activity_name`: Target activity name
   - `experience_name`: Variant name (e.g., "Control", "Variant A")
   - `tag_manager`: Tag manager platform
   - `firing_condition`: When to fire the event

**Example Usage:**

```javascript
// Ask Claude:
"Generate GTM conversion tracking for #signup-button with session-based firing"

// Claude calls:
generateDataLayerEvent({
  selector: "#signup-button",
  activity_name: "Homepage Signup Test",
  experience_name: "Variant A",
  tag_manager: "gtm",
  firing_condition: "once_per_session"
})

// Returns ES5 code:
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

### Verification

**Google Tag Manager:**
1. Open GTM Preview mode
2. Click the tracked element
3. Look for `target_conversion` event in GTM timeline
4. Verify `at_activity` and `at_experience` values

**Adobe Launch:**
```javascript
// Enable debugging
_satellite.setDebug(true);

// Click element, check console for direct call rule
```

**Browser Console:**
```javascript
// Check dataLayer
> dataLayer
// Should show: [{event: "target_conversion", at_activity: "...", at_experience: "..."}]
```

## Code Generation Rules

All generated code follows these strict rules for Adobe Target compatibility:

### ES5 Only (No ES6+)
- ❌ No template literals - Use string concatenation: `'Hello ' + name`
- ❌ No arrow functions - Use `function() {}`
- ❌ No `const`/`let` - Use `var` only
- ❌ No destructuring, spread operators, or other ES6+ features

### DOM & Performance
- ✅ Defensive coding - Always check if elements exist: `if (element) { ... }`
- ✅ Cache selectors - Store in variables: `var button = document.querySelector('.cta')`
- ❌ No polling/setInterval - Elements exist when Target fires
- ✅ Wrap in IIFE - Avoid global pollution: `(function() { ... })()`

### Styling
- ✅ Prefix new classes with `at-` - Example: `at-hero-banner`, `at-cta-button`
- ✅ Use inline styles for specificity - `element.style.property = value`
- ✅ Inject CSS via `<style>` tags in `<head>`
- ✅ Responsive design - Use media queries for mobile/desktop

### Responsive Media Queries
```css
/* Mobile first */
.at-hero-banner {
  font-size: 18px;
  padding: 10px;
}

/* Desktop enhancement */
@media (min-width: 768px) {
  .at-hero-banner {
    font-size: 24px;
    padding: 20px;
  }
}
```

## Default Values System

Configure defaults in `.env` to auto-fill common values:

```bash
# Activity defaults
TARGET_DEFAULT_MBOXES=target-global-mbox,homepage-mbox
TARGET_DEFAULT_PRIORITY=5
TARGET_DEFAULT_VISITOR_PERCENTAGE=100

# Analytics for Target (A4T)
TARGET_A4T_DATA_COLLECTION_HOST=company.sc.omtrdc.net
TARGET_A4T_COMPANY_NAME=Your Company
TARGET_A4T_REPORT_SUITES=prod-rsid,dev-rsid

# Success metrics
TARGET_DEFAULT_METRIC_TYPE=engagement
TARGET_DEFAULT_ENGAGEMENT_METRIC=page_count
TARGET_DEFAULT_METRIC_ACTION=count_once
```

**Benefits:**
- Automatically fills values when creating activities
- Ensures consistency across all activities
- Reduces boilerplate
- Override by explicitly providing values

## Requirements

- **Node.js**: 20+
- **Adobe Target**: Account with Admin API access
- **Chrome Browser**: Required for Chrome DevTools MCP integration
- **MCP Client**: Claude Desktop, Claude Code, or any MCP-compatible client

## Architecture

This project uses three MCP servers working together:

### 1. Adobe Target MCP Server (this project)
- Communicates with Adobe Target Admin API
- Provides 33 tools for Claude to manage Target resources
- Generates ES5-compatible code with dataLayer tracking
- Auto-applies default configurations from `.env`

**Installation:** `npm install` in this directory

### 2. Chrome DevTools MCP Server (REQUIRED)
- Controls live Chrome browser via Chrome DevTools Protocol
- Executes JavaScript in page context for live DOM analysis
- Takes screenshots and DOM snapshots
- Handles navigation and interaction
- Enables `extractDOMWithChromeDevTools` tool

**Installation:** Automatically installed via `npx chrome-devtools-mcp` when configured

**Package:** `chrome-devtools-mcp` (installed on first run)

### 3. Filesystem MCP Server (REQUIRED)
- Provides file read/write capabilities for project files
- Allows Claude to read configurations, write generated code
- Scoped to project directory for security
- Enables file-based workflows

**Installation:** Automatically installed via `npx @modelcontextprotocol/server-filesystem` when configured

**Package:** `@modelcontextprotocol/server-filesystem` (installed on first run)

## Recommended Workflow

### For Normal Development (Recommended)

1. **Generate Offers via MCP**
   - Ask Claude to create HTML offers with Target-compatible code
   - Include conversion tracking with `generateDataLayerEvent`
   - Offers are created in Target and **fully editable in UI**

2. **Build Activities in Target UI**
   - Navigate to Adobe Target UI
   - Create A/B Test or Experience Targeting activity
   - Select API-created offers from library
   - Configure audience, goals, settings
   - Activate and monitor

**Benefits:**
- ✅ AI-generated, optimized code
- ✅ Full UI editing capabilities for both offers and activities
- ✅ Visual Experience Composer (VEC) available
- ✅ QA mode and preview work normally

### For Programmatic/Bulk Operations

Use `createABActivity` for:
- Automated testing workflows (CI/CD)
- Bulk activity creation (100+ activities)
- Template-based deployments
- Activities that won't need UI editing

**Limitations:**
- ❌ Cannot edit in Target UI
- ❌ Cannot use VEC
- ✅ Can update via `updateABActivity` API
- ✅ Can activate/deactivate via `updateActivityState`

## Example Workflows

### Create A/B Test with Conversion Tracking

**User:**
```
Create two HTML offers for a hero banner test:
- Control: Blue button with "Learn More"
- Variant: Green button with "Get Started Now"

Add GTM conversion tracking that fires once per session when users click the button.
```

**Claude will:**
1. Ask clarifying questions (image URLs, exact targeting, etc.)
2. Generate ES5-compatible HTML/CSS for both offers
3. Call `generateDataLayerEvent` for conversion tracking
4. Call `createOffer` twice to create both offers in Target
5. Return offer IDs and instructions for creating activity in Target UI

### Generate Mobile-Responsive Offer

**User:**
```
Create an HTML offer for a promotional banner. Make it responsive -
small text and padding on mobile, larger on desktop. Use a red background.
```

**Claude will:**
1. Generate ES5 code with inline styles
2. Add `<style>` block with media queries
3. Prefix all new classes with `at-`
4. Include defensive element checks
5. Create offer via `createOffer` tool

## Troubleshooting

### Authentication Errors
- Verify `TARGET_API_KEY` and `TARGET_ACCESS_TOKEN` are correct
- Check token hasn't expired (regenerate in Adobe Developer Console)

### Offers Not Appearing in Workspace
- Verify `TARGET_WORKSPACE_ID` matches your workspace
- Check workspace permissions for API user

### Conversion Events Not Firing
- Open browser console and check for JavaScript errors
- Verify tag manager object exists (e.g., `window.dataLayer`)
- Check firing condition behavior (session-based won't fire twice)
- Use tag manager debug mode (GTM Preview, `_satellite.setDebug(true)`)

### Code Not Working in Target
- Ensure code is ES5-compatible (no arrow functions, template literals)
- Check for defensive element checks: `if (element) { ... }`
- Verify selectors are specific (not broad like `.button`)

## License

MIT License - See LICENSE file

## Links

- [Adobe Target Admin API Documentation](https://developers.adobetarget.com/api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [GitHub Repository](https://github.com/scottehastings16/adobe-target-mcp)

## Contributing

This is a personal project, but suggestions and issues are welcome on GitHub.

## Version History

### 2.0.0 (Current)
- Removed JSDOM dependencies for lighter footprint
- Added DataLayer event generation with multiple tag manager support
- Added configurable firing conditions (session, throttle, debounce, etc.)
- Added default values system for consistent configurations
- Enhanced ES5 code generation with responsive design support
- Added 33 comprehensive tools for full Target API coverage
- Optimized workflow: Create offers via API → Build activities in UI

### 1.0.0
- Initial release with basic Target API integration
