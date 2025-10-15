/**
 * Get Entity Revisions Tool
 * Get all revisions of a specific entity, in descending order by time
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getEntityRevisions',
  description: `Get all revisions (audit history) of a specific entity by ID, in descending order by time.

NOTE:
- Only the latest 100 revisions are retained per entity (including CREATE and DELETE actions)
- For admin page entities, only concrete updates are recorded
- For authorizedHosts, use client ID as entity ID`,
  inputSchema: {
    type: 'object',
    properties: {
      revisionResourceType: {
        type: 'string',
        enum: ['activity', 'audience', 'offer', 'profileScript', 'property', 'environment', 'responseToken', 'host', 'authorizedHosts'],
        description: 'Entity type to fetch revisions for',
      },
      id: {
        type: 'number',
        description: 'Entity ID (for authorizedHosts, use client ID)',
      },
    },
    required: ['revisionResourceType', 'id'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  const path = `/target/revisions/${args.revisionResourceType}/${args.id}`;
  return await makeTargetRequest(config, 'GET', path, null, 'v1');
}
