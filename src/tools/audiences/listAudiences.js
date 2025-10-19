/**
 * List Audiences Tool
 * List all audiences
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'listAudiences',
  description: `List all audiences available in Adobe Target.

USAGE:
Use this tool to retrieve available audiences when creating activities with audience targeting.
Each audience object contains an 'id' (number) and 'name' (string) that you can display to the user.

WORKFLOW:
1. Call this tool to get list of audiences
2. Present audiences to user in a clear format (e.g., "1) Mobile Users (ID: 12345), 2) Desktop Users (ID: 67890)")
3. User selects audience by name or number
4. Extract the audience ID from the selected audience
5. Pass the ID(s) to createActivityFromModifications via the audienceIds parameter`,
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of audiences to return',
      },
      offset: {
        type: 'number',
        description: 'Number of audiences to skip',
      },
    },
  },
};

export async function handler(args, context) {
  const { config } = context;

  const queryParams = new URLSearchParams();
  if (args.limit) queryParams.append('limit', args.limit);
  if (args.offset) queryParams.append('offset', args.offset);

  const path = `/target/audiences${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return await makeTargetRequest(config, 'GET', path, null, 'v3');
}
