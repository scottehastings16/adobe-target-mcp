/**
 * List Response Tokens Tool
 * Retrieve list of response tokens
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'listResponseTokens',
  description: 'Retrieve list of response tokens, including built-in and custom tokens with their active status',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'GET', '/target/responsetokens', null, 'v1');
}
