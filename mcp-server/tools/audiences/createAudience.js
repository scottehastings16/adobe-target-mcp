/**
 * Create Audience Tool
 * Create a new audience
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createAudience',
  description: 'Create a new audience',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Audience name',
      },
      description: {
        type: 'string',
        description: 'Audience description',
      },
      targetRule: {
        type: 'object',
        description: 'Audience targeting rules',
      },
    },
    required: ['name'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  const audienceCreate = { name: args.name };
  if (args.description) audienceCreate.description = args.description;
  if (args.targetRule) audienceCreate.targetRule = args.targetRule;

  return await makeTargetRequest(config, 'POST', '/target/audiences', audienceCreate, 'v3');
}
