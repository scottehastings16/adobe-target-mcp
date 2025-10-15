/**
 * List Mbox Profile Attributes Tool
 * List all profile attributes associated with mboxes
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'listMboxProfileAttributes',
  description: 'List all profile attributes associated with mboxes in Adobe Target',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'GET', '/target/profileattributes/mbox', null, 'v1');
}
