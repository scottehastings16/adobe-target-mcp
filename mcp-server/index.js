#!/usr/bin/env node

/**
 * Adobe Target Admin API MCP Server
 * Provides tools to manage Target activities, offers, audiences, and more via the Admin API
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadTools } from './tools/index.js';
import { randomBytes } from 'crypto';
import { tmpdir } from 'os';
import { unlinkSync, existsSync } from 'fs';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the mcp-server directory
// Suppress any stdout output during dotenv loading (it breaks JSON-RPC over stdio)
const originalLog = console.log;
console.log = () => {}; // Temporarily silence console.log
dotenv.config({ path: join(__dirname, '.env'), debug: false });
console.log = originalLog; // Restore console.log

// Configuration (should be set via environment variables)
const config = {
  // Authentication
  tenantId: process.env.TARGET_TENANT_ID || '',
  apiKey: process.env.TARGET_API_KEY || '',
  accessToken: process.env.TARGET_ACCESS_TOKEN || '',
  workspaceId: process.env.TARGET_WORKSPACE_ID || '', // Optional: Filter to specific workspace

  // Activity Defaults
  defaults: {
    // Default mboxes (array)
    mboxes: process.env.TARGET_DEFAULT_MBOXES
      ? process.env.TARGET_DEFAULT_MBOXES.split(',').map(m => m.trim())
      : ['target-global-mbox'],

    // Default priority (0-999)
    priority: parseInt(process.env.TARGET_DEFAULT_PRIORITY || '5', 10),

    // Default visitor percentage
    visitorPercentage: parseInt(process.env.TARGET_DEFAULT_VISITOR_PERCENTAGE || '100', 10),

    // Success Metrics Defaults
    metricType: process.env.TARGET_DEFAULT_METRIC_TYPE || 'engagement',
    engagementMetric: process.env.TARGET_DEFAULT_ENGAGEMENT_METRIC || 'page_count',
    metricAction: process.env.TARGET_DEFAULT_METRIC_ACTION || 'count_once',
    successMbox: process.env.TARGET_DEFAULT_SUCCESS_MBOX || 'orderConfirmPage',
    successEvent: process.env.TARGET_DEFAULT_SUCCESS_EVENT || 'mbox_shown',

    // Analytics for Target (A4T) Defaults
    a4t: {
      dataCollectionHost: process.env.TARGET_A4T_DATA_COLLECTION_HOST || '',
      companyName: process.env.TARGET_A4T_COMPANY_NAME || '',
      reportSuites: process.env.TARGET_A4T_REPORT_SUITES
        ? process.env.TARGET_A4T_REPORT_SUITES.split(',').map(rs => rs.trim())
        : [],
    },
  },
};

// Create temp file paths for this session
const sessionId = randomBytes(8).toString('hex');
const tempFilePath = join(tmpdir(), `at-mcp-page-analysis-${sessionId}.html`);
const tempCSSPath = join(tmpdir(), `at-mcp-page-styles-${sessionId}.css`);

// Cleanup temp files on shutdown
process.on('exit', () => {
  try {
    if (existsSync(tempFilePath)) {
      unlinkSync(tempFilePath);
      console.error('[MCP Server] Cleaned up HTML temp file');
    }
    if (existsSync(tempCSSPath)) {
      unlinkSync(tempCSSPath);
      console.error('[MCP Server] Cleaned up CSS temp file');
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});

// Also handle SIGINT (Ctrl+C) and SIGTERM
process.on('SIGINT', () => {
  console.error('\n[MCP Server] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\n[MCP Server] Shutting down...');
  process.exit(0);
});

// Create server factory function
function createServer() {
  return new Server(
    {
      name: 'adobe-target-admin-api',
      version: '2.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
}

// Setup request handlers for a server instance
async function setupServerHandlers(server) {
  // Load all tools dynamically
  const { tools, handlers } = await loadTools();

  // List all available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      // Check if handler exists
      const handler = handlers[name];
      if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
      }

      // Create context object with shared resources
      const context = {
        config,
        tempFilePath, // Shared temp file path for page HTML
        tempCSSPath, // Shared temp file path for page CSS
      };

      // Execute the handler
      const result = await handler(args, context);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });
}

// Start the server
async function main() {
  console.error('[MCP Server] Adobe Target Admin API MCP Server starting...');
  console.error('[MCP Server] Tenant ID:', config.tenantId || 'NOT SET');
  console.error('[MCP Server] API Key:', config.apiKey ? '***' + config.apiKey.slice(-4) : 'NOT SET');
  console.error('[MCP Server] Access Token:', config.accessToken ? '***' + config.accessToken.slice(-4) : 'NOT SET');
  console.error('[MCP Server] Workspace ID:', config.workspaceId || 'ALL WORKSPACES');
  console.error('[MCP Server] Default Mboxes:', config.defaults.mboxes.join(', '));
  console.error('[MCP Server] Default Priority:', config.defaults.priority);
  if (config.defaults.a4t.dataCollectionHost) {
    console.error('[MCP Server] A4T Enabled:', config.defaults.a4t.reportSuites.join(', '));
  }

  // Create and start MCP server with stdio transport
  const server = createServer();
  await setupServerHandlers(server);
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[MCP Server] ✓ Server ready - connected via stdio transport');
}

main().catch((error) => {
  console.error('[MCP Server] Fatal error:', error);
  process.exit(1);
});
