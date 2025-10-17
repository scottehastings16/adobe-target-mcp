# Adobe Target MCP Agent

An MCP server for creating and managing Adobe Target HTML & JSON offers, audiences, mboxes, reporting, response tokens and more.

> **UNOFFICIAL**: 

MCP Standard Compliance: This project follows the open Model Context Protocol standard, and in theory should work with any MCP-compatible client - although it has only been tested with Claude Desktop.

This is an experimental MCP.

⚠️Important: This project is not affiliated with, endorsed by, or sponsored by Adobe Systems Incorporated. This is an unofficial, independent integration using Adobe Target's publically documented APIs. This agent interacts with AI services and your Adobe Target account. Be mindful of the risks when using AI agents for commercial work, including potential exposure of sensitive data to AI providers. You are solely responsible for reviewing all code, managing API credentials securely, and ensuring compliance with your organization's policies. Use at your own risk - the author assumes no liability for data exposure, account issues, or business impacts.



## Installation

### Prerequisites

- Node.js 20 or higher
- Chrome/Chromium browser
- Adobe Target account with Admin API access
- MCP-compatible client (Claude Desktop, Claude Code, Cursor, Windsurf)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/scottehastings16/adobe-target-mcp.git
cd adobe-target-mcp

# Install dependencies
cd mcp-server
npm install
```

### Step 2: Configure Adobe Target Credentials

Copy the example environment file and add your credentials:
1
```bash
cp .env.example .env
```

Edit `.env` with your Adobe Target credentials:

```env
# Required - Adobe Target API Credentials
TARGET_TENANT_ID=your_tenant_id          # e.g., mycompany
TARGET_API_KEY=your_api_key              # From Adobe Developer Console
TARGET_ACCESS_TOKEN=your_access_token    # Generate via From Adobe Developer Console

# Optional - Default Configuration
TARGET_WORKSPACE_ID=                     # Filter by workspace (leave empty for all)
TARGET_DEFAULT_MBOXES=target-global-mbox # Default mboxes for activities
TARGET_DEFAULT_PRIORITY=0                # Default activity priority (0-999)
TARGET_DEFAULT_METRIC_NAME=conversion    # Default success metric name
TARGET_DEFAULT_METRIC_MBOX=              # Mbox for conversion tracking
```

### Step 3: Configure Your MCP Client

#### For Claude Desktop

Add to your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "at-mcp": {
      "command": "node",
      "args": ["C:/Users/your_username/at-mcp/mcp-server/index.js"],
      "env": {
        "NODE_OPTIONS": "--no-deprecation"
      }
    },
    "chrome-devtools-mcp": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp"]
    }
  }
}
```

#### For Cursor

Add to `.cursor/config/servers.json`:

```json
{
  "at-mcp": {
    "command": "node",
    "args": ["./mcp-server/index.js"],
    "cwd": "/path/to/at-mcp",
    "env": {
      "NODE_OPTIONS": "--no-deprecation"
    }
  }
}
```

### Step 4: Verify Installation

1. Restart your MCP client (Claude Desktop, Cursor, etc.)
2. Check that the server loads without errors
3. Test with a simple command:
   ```
   List all available Adobe Target templates
   ```

## Available Tools

### Activities (5 tools)
| Tool | Description | 
|------|-------------|
| `listActivities` | List all activities with filtering options |
| `createABActivity` | Create A/B test activity via API |
| `getABActivity` | Get activity details by ID |
| `updateABActivity` | Update activity configuration |
| `updateActivityState` | Change activity state (activate/pause/deactivate) |

### Offers (4 tools)
| Tool | Description | 
|------|-------------|
| `listOffers` | List all offers with filtering |
| `createOffer` |  Create custom or templated HTML Offers |
| `createJsonOffer` | Create JSON offers |
| `updateOffer` | Update existing offer content |

### Audiences (2 tools)
| Tool | Description |
|------|-------------|
| `listAudiences` | List all audience segments |
| `createAudience` | Create new audience with rules |

### Reports (6 tools)
| Tool | Description |
|------|-------------|
| `getABPerformanceReport` | A/B test performance metrics |
| `getABOrdersReport` | A/B test order/revenue data |
| `getXTPerformanceReport` | Experience Targeting performance |
| `getActivityInsights` | Detailed activity analytics |
| `getAPTPerformanceReport` | Auto-Personalization metrics |
| `getXTOrdersReport` | XT order/revenue metrics |

### Custom Tools (5 tools)
| Tool | Description |
|------|-------------|
| `generateOfferContent` | Generate HTML/JSON content from templates |
| `generateScript` | Create preview/injection scripts |
| `generateDataLayerEvent` | Generate tracking code for tag managers |
| `createActivityFromModifications` | Create activity from page modifications |
| `listTemplates` | Browse all 19 available templates |

## Templates

### HTML Templates (Add your own) (10)
- **carousel** - Multi-slide image/content carousel
- **hero-banner** - Full-width hero section
- **cta-button** - Call-to-action button
- **modal** - Popup modal dialog
- **sticky-header** - Persistent header bar
- **countdown-timer** - Urgency countdown
- **form-field** - Form input modifications
- **tabs** - Tabbed content sections
- **accordion** - Collapsible content panels
- **notification-banner** - Alert/info banner

### JSON Templates (Add your own)(9)
- **product-recommendations** - Personalized product data
- **feature-flags** - Feature toggle configuration
- **hero-config** - Hero section settings
- **pricing-data** - Dynamic pricing information
- **personalization-content** - User-specific content
- **navigation-menu** - Dynamic navigation structure
- **form-config** - Form field configuration
- **testimonials** - Customer testimonials data
- **ab-test-variant** - A/B test variant data

## Event Tracking

### Supported Tag Managers
- **Google Tag Manager** - `dataLayer.push()`
- **Adobe Launch** - `_satellite.track()` or `adobeDataLayer.push()`
- **Tealium iQ** - `utag.link()`
- **Segment** - `analytics.track()`
- **Mixpanel** - `mixpanel.track()`
- **Custom DataLayer** - Configurable structure

### Firing Conditions
- **always** - Fire on every interaction
- **once_per_session** - Single conversion per session (recommended)
- **once_per_page** - Once per page load
- **once_ever** - Permanent (uses localStorage)
- **throttle** - Limit frequency (e.g., scroll events)
- **debounce** - Wait for idle (e.g., search input)

## Configuration Files

### tag-managers.json
Define custom tag manager integrations:
```json
{
  "customTM": {
    "name": "Custom Tag Manager",
    "template": "window.customDataLayer.push({...});"
  }
}
```

### firing-conditions.json
Add custom firing logic:
```json
{
  "custom_condition": {
    "name": "Custom Condition",
    "description": "Your custom logic",
    "template": "// Your condition code"
  }
}
```
```

## Security Considerations

### API Credentials
- Store credentials in `.env` file only
- Never commit `.env` to version control
- Use environment-specific tokens
- Rotate access tokens regularly
- Limit API key permissions to required scopes

### Code Review
- All generated code should be reviewed before production
- Test in development environment first
- Validate tracking implementation
- Check browser compatibility


## License
MIT License - See [LICENSE](LICENSE) file for details
