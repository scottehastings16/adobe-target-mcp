/**
 * List Mboxes Tool
 * List all mboxes
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'listMboxes',
  description: 'List all mboxes',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'GET', '/target/mboxes', null, 'v1');
}
