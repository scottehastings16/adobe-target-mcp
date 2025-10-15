# Adobe Target Admin API MCP Server

Model Context Protocol server for Adobe Target, enabling AI agents to create and manage Target activities, offers, and audiences.

## ⚠️ Critical: API Activity Limitations

**Activities created via the Admin API CANNOT be edited in the Adobe Target UI.** This is an Adobe Target platform restriction.

**Recommended workflow:**
1. Create offers via API (fully editable in UI)
2. Build activities manually in Target UI using those offers

See **WORKFLOW.md** for detailed guidance on recommended workflows.

## Features

- **Full Adobe Target API Integration**: Activities, offers, audiences, resources
- **Chrome DevTools MCP Integration**: Live browser analysis and preview
- **Custom Chrome Extension Support**: Interactive element selection and preview
- **WebSocket Communication**: Real-time preview delivery to browser

## Quick Start

See **QUICKSTART.md** (coming soon) or **INTEGRATION-GUIDE.md** for setup instructions.

## Project Structure

```
mcp-server/
├── index.js                    # Main MCP server
├── helpers/
│   └── makeTargetRequest.js    # Adobe Target API helper
├── tools/
│   ├── activities/             # Activity management (create, list, update, delete)
│   ├── offers/                 # Offer management (create, list, update, delete)
│   ├── audiences/              # Audience management (create, list)
│   ├── resources/              # Properties, environments, mboxes
│   └── analysis/               # Page analysis and preview tools
└── docs/
    ├── INTEGRATION-GUIDE.md    # Detailed integration guide
    └── WORKFLOW-EXAMPLES.md    # Step-by-step examples
```

## Available Tools

### Activities (6 tools)
- `listActivities` - List all Target activities
- `createABActivity` - Create A/B test
- `getABActivity` - Get activity details
- `updateABActivity` - Update activity
- `updateActivityState` - Activate/pause/deactivate
- `deleteABActivity` - Delete activity

### Offers (5 tools)
- `listOffers` - List all offers
- `createOffer` - Create HTML/JSON offer
- `getOffer` - Get offer details
- `updateOffer` - Update offer content
- `deleteOffer` - Delete offer

### Audiences (2 tools)
- `listAudiences` - List all audiences
- `createAudience` - Create new audience

### Resources (3 tools)
- `listProperties` - List Target properties
- `listEnvironments` - List environments
- `listMboxes` - List mboxes

### Analysis (4 tools)
- `extractDOMWithChromeDevTools` - Get JavaScript snippets for Chrome DevTools MCP
- `createActivityFromModifications` - Generate Target activity JSON
- `sendPreviewToExtension` - Send preview to custom Chrome extension
- `highlightElementsForSelection` - Interactive element picker

## Chrome DevTools MCP Integration

This server is designed to work alongside [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) for live browser-based page analysis.

**Benefits:**
- Extract live rendered HTML/CSS (not static HTML)
- Access computed styles (actual applied CSS)
- Preview modifications in real browser
- Take screenshots for visual confirmation
- Handle JavaScript-rendered content

See **INTEGRATION-GUIDE.md** for complete setup instructions.

## Configuration

### Authentication (Required)

Environment variables:
- `TARGET_TENANT_ID` - Adobe Target tenant ID (required)
- `TARGET_API_KEY` - Adobe Target API key (required)
- `TARGET_ACCESS_TOKEN` - Adobe Target access token (required)
- `TARGET_WORKSPACE_ID` - Workspace ID (optional)

### Default Values (Optional)

Configure default values for activities to reduce repetition and ensure consistency:

```bash
# Activity defaults
TARGET_DEFAULT_MBOXES=target-global-mbox
TARGET_DEFAULT_PRIORITY=5
TARGET_DEFAULT_VISITOR_PERCENTAGE=100

# Analytics for Target (A4T) defaults
TARGET_A4T_DATA_COLLECTION_HOST=company.sc.omtrdc.net
TARGET_A4T_COMPANY_NAME=Company Name
TARGET_A4T_REPORT_SUITES=prod-rsid

# Success metrics defaults
TARGET_DEFAULT_SUCCESS_MBOX=orderConfirmPage
TARGET_DEFAULT_METRIC_ACTION=count_once
TARGET_DEFAULT_SUCCESS_EVENT=mbox_shown
```

**Benefits:**
- Automatically fills common values when creating activities
- Ensures consistent configuration across all activities
- Reduces boilerplate in activity definitions
- Override any default by explicitly providing a value

See **DEFAULTS.md** for complete documentation and **examples/using-defaults.md** for practical examples.

### Server Configuration

- `MCP_TRANSPORT` - Transport mode: stdio, sse, or both (default: both)
- `MCP_PORT` - Port for SSE transport (default: 3000)
- `WS_PORT` - WebSocket port for Chrome extension (default: 8767)

## Usage with Claude

Add to your Claude configuration:

```json
{
  "mcpServers": {
    "adobe-target": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "TARGET_TENANT_ID": "your-tenant-id",
        "TARGET_API_KEY": "your-api-key",
        "TARGET_ACCESS_TOKEN": "your-access-token"
      }
    }
  }
}
```

## Documentation

- **WORKFLOW.md** - ⭐ **START HERE** - Recommended workflows and API limitations
- **INTEGRATION-GUIDE.md** - Complete integration guide with Chrome DevTools MCP
- **WORKFLOW-EXAMPLES.md** - Step-by-step workflow examples
- **DEFAULTS.md** - Default values configuration guide
- **examples/using-defaults.md** - Practical examples of using defaults
- **claude-config-example.json** - Example Claude configuration
- **.env.example** - Template for environment configuration

## Requirements

- Node.js 20+
- Adobe Target account with Admin API access
- Chrome browser (for Chrome DevTools MCP integration)

## Architecture

### MCP Server (this project)
- Communicates with Adobe Target Admin API
- Provides tools for Claude to manage Target resources
- Optionally connects to custom Chrome extension via WebSocket

### Chrome DevTools MCP (separate project)
- Controls live Chrome browser
- Executes JavaScript in page context
- Takes screenshots and snapshots
- Handles navigation and interaction

### Custom Chrome Extension (optional)
- Connects to this MCP server via WebSocket
- Receives preview requests from Claude
- Displays interactive element highlights
- Sends user selections back to Claude

## What Changed?

This project previously included static HTML parsing helpers using JSDOM. These have been **removed** in favor of Chrome DevTools MCP:

**Removed files:**
- `helpers/fetchPageHTML.js` - HTTP-based HTML fetching
- `helpers/cleanHTML.js` - JSDOM-based HTML cleaning
- `helpers/extractCSS.js` - Static CSS extraction
- `helpers/analyzeHTML.js` - JSDOM-based DOM analysis
- `tools/analysis/fetchAndAnalyzePage.js` - Combined analysis tool

**Why removed?**
- Chrome DevTools MCP provides superior live browser access
- No memory overhead from JSDOM parsing
- Handles JavaScript-rendered content
- Accesses computed styles (actual applied CSS)
- More accurate and scalable

## License

See root LICENSE file.

## Links

- [Adobe Target Admin API Docs](https://developers.adobetarget.com/api/)
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
