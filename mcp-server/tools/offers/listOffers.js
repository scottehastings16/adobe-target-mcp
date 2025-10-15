/**
 * List Offers Tool
 * List all offers
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'listOffers',
  description: 'List all offers',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of offers to return',
      },
      offset: {
        type: 'number',
        description: 'Number of offers to skip',
      },
    },
  },
};

export async function handler(args, context) {
  const { config } = context;

  const queryParams = new URLSearchParams();
  if (args.limit) queryParams.append('limit', args.limit);
  if (args.offset) queryParams.append('offset', args.offset);

  const path = `/target/offers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return await makeTargetRequest(config, 'GET', path, null, 'v2');
}
