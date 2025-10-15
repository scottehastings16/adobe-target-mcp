/**
 * Update Activity State Tool
 * Update the state of an activity (approved, deactivated, saved)
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'updateActivityState',
  description: 'Update the state of an activity (approved, deactivated, saved)',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Activity ID',
      },
      state: {
        type: 'string',
        enum: ['approved', 'deactivated', 'saved'],
        description: 'New state - "approved" (Live), "deactivated" (Inactive), or "saved"',
      },
    },
    required: ['id', 'state'],
  },
};

export async function handler(args, context) {
  const { config } = context;
  return await makeTargetRequest(config, 'PUT', `/target/activities/${args.id}/state`, { state: args.state });
}
