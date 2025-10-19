/**
 * List Activities Tool
 * List all Target activities with optional filtering and sorting
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'listActivities',
  description: 'List all Target activities with optional filtering and sorting',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of activities to return',
      },
      offset: {
        type: 'number',
        description: 'Number of activities to skip',
      },
      sortBy: {
        type: 'string',
        description: 'Field to sort by (e.g., "id", "name", "state")',
      },
    },
  },
};

export async function handler(args, context) {
  const { config } = context;

  const queryParams = new URLSearchParams();
  if (args.limit) queryParams.append('limit', args.limit);
  if (args.offset) queryParams.append('offset', args.offset);
  if (args.sortBy) queryParams.append('sortBy', args.sortBy);

  // NOTE: Workspace filtering removed temporarily to debug
  // Adobe Target API may not support workspace filtering via query params
  // or may require numeric workspace ID instead of workspace name
  // if (config.workspaceId) queryParams.append('workspace', config.workspaceId);

  const path = `/target/activities${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return await makeTargetRequest(config, 'GET', path, null, 'v3');
}
