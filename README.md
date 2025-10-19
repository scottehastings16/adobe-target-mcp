# Adobe Target MCP

An (**Unofficial**) Model Context Protocol Agent Framework for Adobe Target, enabling your favorite MCP Clients to create and manage Adobe Target activities, HTML & JSON offers, audiences, response tokens and activity reporting all through natrual language

**MCP Standard Compliance:** This project follows the open Model Context Protocol standard and works with any MCP-compatible client (Claude Desktop, Cursor, or other MCP clients). Configuration examples below use Claude Desktop/Code, but the same `mcpServers` format applies to all MCP clients.

This is an experimental MCP agent under active development. While tested and functional, induvidual use cases will vary and your own modifactions can make it work for you.

**⚠️Important:** This project is not affiliated with, endorsed by, or sponsored by Adobe Systems Incorporated. This is an unofficial, independent integration using Adobe Target's publically documented Adobe Target Admin API. This agent interacts with AI services and your Adobe Target account. Be mindful of the risks when using AI agents for commercial work, including potential exposure of sensitive data to AI providers. You are solely responsible for reviewing all code, managing API credentials securely, and ensuring compliance with your organization's policies. The author assumes no liability for data exposure, account issues, or business impacts.
Adobe Target API Documentation: https://developer.adobe.com/target/administer/admin-api/

---

## Table of Contents

- [Core Capabilities](#core-capabilities)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Available Tools](#available-tools)
- [License](#license)
- [Links](#links)

---

### Core Capabilities
- **Adobe Target Admin API Integration**: Complete suite of 33 tools for managing A/B tests, Experience Targeting, offer creation (HTML/JSON), audiences, mboxes, properties, activity performance reports and response tokens
- **Activity Reporting**: Query results for live and past activities
- **Response Token Managment**: Create new resposne tokens and take inventory of existing ones
- **Intelligent Offer Creation**: Generate HTML offers, or JSON offers for headless/SPA implementations with structured data templates
- **Audience Managment and Creation**: List exisiting audiences in your AT property, or create new ones with natrual language
- **DataLayer Event Generation**: Automated conversion in HTML offers tracking for GTM, Adobe Launch, Tealium, Segment
- 
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
git clone https://github.com/scottehastings16/adobe-target-mcp.git
cd adobe-target-mcp
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
- Automatically installed via `npx` when adobe-target-mcp is configured
- Requires Chrome or Chromium browser

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
      "args": ["C:\\Users\\YourUsername\\adobe-target-mcp\\src\\index.js"],
      "env": {}
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
- **Windows:** Use backslashes with escaping: `"C:\\Users\\YourUsername\\adobe-target-mcp\\..."`
- **Mac/Linux:** Use forward slashes: `"/Users/yourname/adobe-target-mcp/..."`

### 6. Start Using

Once configured, you can ask your AI assistant to:
- "Show me the results from the Paid Media Personalization activity"
- "Create a carousel under the hero image on my website www.example.com"
- "Show me what response tokens are avilable in my targt propert"
- "Generate a popup module for my page www.example.com, add a CTA and this image: example.com/image.png... add a CTA that links to the products page at this link example.com/products"
- "Create a JSON offer for feature flags"
- "List all active Target activities"
- "List avilable mboxes in my property"
- "Generate a conversion report for the Buy Now CTA Test"
- "Help me create a new response token"
- Update the "Buy Now" Offer with a new stlying using by configured brand colors

The agent will use its 33 tools to interact with Adobe Target on your behalf.

---

### External MCP Servers

1. **chrome-devtools-mcp** (auto-installed via npx)
   - Purpose: Live browser control, DOM analysis, screenshots
   - Installation: Automatic on first run via `npx -y chrome-devtools-mcp`
   - Requirements: Chrome/Chromium browser


### System Requirements

- **Node.js**: 20+ (ES modules support required)
- **Adobe Target**: Account with Admin API access
- **Chrome Browser**: Required for Chrome DevTools MCP integration
- **MCP Client**: Claude Desktop, Claude Code, or any MCP-compatible client

---

## Project Structure

```
adobe-target-mcp/
├── src/
│   ├── index.js                        # Main MCP server entry point
│   ├── .env.example                    # Environment variable template
│   │
│   ├── config/
│   │   ├── tag-managers.json           # Tag manager configurations (GTM, Adobe Launch, Tealium, Segment)
│   │   └── firing-conditions.json      # Event firing logic (session, throttle, debounce, etc.)
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
│       └── custom/                     # DataLayer & preview tools (4 tools)
│           ├── generateDataLayerEvent.js
│           ├── createActivityFromModifications.js
│           ├── generatePreviewScript.js
│           └── getMockupAnalysisInstructions.js
│
├── package.json                        # Node.js dependencies
├── .env                                # Environment variables (create from .env.example)
└── README.md                           # This file
```

---
---

## Available Tools

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

### Custom Tools (4 tools)
- `generateDataLayerEvent` - **Generate conversion tracking code** with tag manager support
- `createActivityFromModifications` - Create Target activity from JavaScript modifications (advanced use, API limitations apply)
- `generatePreviewScript` - Generate preview script for Chrome DevTools MCP injection
- `getMockupAnalysisInstructions` - Get instructions for mockup analysis and experience generation workflow



---

## License

MIT License - See LICENSE file

---

## Links

- [Adobe Target Admin API Documentation](https://developer.adobe.com/target/administer/admin-api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [GitHub Repository](https://github.com/scottehastings16/adobe-target-mcp)

---
