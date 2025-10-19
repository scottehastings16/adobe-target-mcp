/**
 * Get AT.js Settings Tool
 * Retrieve AT.js settings and configuration
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getAtjsSettings',
  description: 'Retrieve AT.js settings including client code, decisioning method, timeout, global mbox configuration, and other AT.js library settings',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'GET', '/target/atjs/settings', null, 'v1');
}
