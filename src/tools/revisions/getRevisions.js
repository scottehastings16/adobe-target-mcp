/**
 * Get Revisions Audit Log Tool
 * Get audit log revisions filtered by author's name and modified-after timestamp
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getRevisions',
  description: 'Get all revisions (audit log) for a specific resource type, filtered by author\'s name and optionally by modified-after timestamp (defaults to last 1 day)',
  inputSchema: {
    type: 'object',
    properties: {
      revisionResourceType: {
        type: 'string',
        enum: ['activity', 'audience', 'offer', 'profileScript', 'property', 'environment', 'responseToken', 'host', 'authorizedHosts'],
        description: 'Entity type to fetch revisions for',
      },
      modifiedBy: {
        type: 'string',
        description: 'Author\'s name to filter revisions',
      },
      modifiedAt: {
        type: 'string',
        description: 'Optional modified-after timestamp in ISO-8601 format (e.g., "2024-01-01T00:00:00Z"). Defaults to last 1 day if not provided.',
      },
    },
    required: ['revisionResourceType', 'modifiedBy'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  const queryParams = new URLSearchParams();
  queryParams.append('modifiedBy', args.modifiedBy);

  if (args.modifiedAt) {
    queryParams.append('modifiedAt', args.modifiedAt);
  }

  const path = `/target/revisions/${args.revisionResourceType}?${queryParams.toString()}`;
  return await makeTargetRequest(config, 'GET', path, null, 'v1');
}
