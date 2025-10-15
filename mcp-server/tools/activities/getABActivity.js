/**
 * Get AB Activity Tool
 * Get details of a specific A/B Test activity
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getABActivity',
  description: 'Get details of a specific A/B Test activity',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Activity ID',
      },
    },
    required: ['id'],
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'GET', `/target/activities/ab/${args.id}`, null, 'v3');
}
