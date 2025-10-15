/**
 * Get Mbox Tool
 * Get details of a specific mbox including parameters and audience associations
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getMbox',
  description: 'Get details of a specific mbox by name, including location ID, name, and associated audience IDs',
  inputSchema: {
    type: 'object',
    properties: {
      mboxName: {
        type: 'string',
        description: 'The name of the mbox (e.g., "target-global-mbox", "hero-mbox")',
      },
    },
    required: ['mboxName'],
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'GET', `/target/mbox/${args.mboxName}`, null, 'v1');
}
