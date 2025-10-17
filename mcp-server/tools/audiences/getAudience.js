/**
 * Get Audience Tool
 * Get detailed information about a specific audience including its targetRule structure
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getAudience',
  description: 'Get detailed information about a specific audience by ID, including its complete targetRule structure',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Audience ID',
      },
    },
    required: ['id'],
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'GET', `/target/audiences/${args.id}`, null, 'v3');
}
