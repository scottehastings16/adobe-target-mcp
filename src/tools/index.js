/**
 * Tool Loader
 * Dynamically loads all tools from subdirectories
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load all tools from the tools directory
 * @returns {Promise<{tools: Array, handlers: Object}>}
 */
export async function loadTools() {
  const tools = [];
  const handlers = {};

  // Get all subdirectories in tools folder (matching Adobe Target Admin API structure)
  const toolDirs = [
    'activities',
    'atjs',
    'audiences',
    'batch',
    'clients',
    'custom',
    'environments',
    'mboxes',
    'offers',
    'on-device-decisioning',
    'properties',
    'reports',
    'response-tokens',
    'revisions'
  ];

  for (const dir of toolDirs) {
    const dirPath = join(__dirname, dir);

    try {
      const files = readdirSync(dirPath);

      for (const file of files) {
        if (file.endsWith('.js')) {
          const modulePath = `./${dir}/${file}`;
          const module = await import(modulePath);

          if (module.tool && module.handler) {
            tools.push(module.tool);
            handlers[module.tool.name] = module.handler;
          }
        }
      }
    } catch (error) {
      console.error(`[Tool Loader] Error loading tools from ${dir}:`, error.message);
    }
  }

  console.error(`[Tool Loader] Loaded ${tools.length} tools`);
  return { tools, handlers };
}
