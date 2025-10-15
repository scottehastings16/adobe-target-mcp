/**
 * Get Offer Tool
 * Get details of a specific offer
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getOffer',
  description: 'Get details of a specific offer',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Offer ID',
      },
    },
    required: ['id'],
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'GET', `/target/offers/content/${args.id}`, null, 'v1');
}
