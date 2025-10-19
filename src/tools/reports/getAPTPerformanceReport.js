/**
 * Get APT Activity Performance Report
 * Get performance report for an Automated Personalization Test activity
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getAPTPerformanceReport',
  description: 'Get performance report for an Automated Personalization Test (APT) activity with metrics, conversions, and visitor data',
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

  let path = `/target/activities/abt/${args.id}/report/performance`;

  // Add reportInterval if provided
  if (args.reportInterval) {
    path += `?reportInterval=${encodeURIComponent(args.reportInterval)}`;
  }

  return await makeTargetRequest(config, 'GET', path, null, 'v1');
}
