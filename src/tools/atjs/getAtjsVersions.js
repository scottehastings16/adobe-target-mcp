/**
 * Get AT.js Versions Tool
 * Retrieve available AT.js versions
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getAtjsVersions',
  description: 'Retrieve list of available AT.js versions',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'GET', '/target/atjs/versions', null, 'v1');
}
