/**
 * Get XT Activity Orders Report
 * Get orders report data for an Experience Targeting activity
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getXTOrdersReport',
  description: 'Get orders report data for an Experience Targeting (XT) activity, including conversion metrics and order information',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Activity ID',
      },
      reportInterval: {
        type: 'string',
        description: 'Optional date range in ISO 8601 format (e.g., "2024-01-01T00:00-07:00/2024-02-01T00:00-07:00")',
      },
    },
    required: ['id'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  let path = `/target/activities/xt/${args.id}/report/orders`;

  // Add reportInterval if provided
  if (args.reportInterval) {
    path += `?reportInterval=${encodeURIComponent(args.reportInterval)}`;
  }

  return await makeTargetRequest(config, 'GET', path, null, 'v1');
}
