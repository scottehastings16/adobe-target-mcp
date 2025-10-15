/**
 * Update Offer Tool
 * Update an existing offer
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'updateOffer',
  description: `Update an existing offer. This is a PUT request that updates the offer's name and/or content.

IMPORTANT: The 'name' parameter is REQUIRED by the Adobe Target API.
Even if you're only updating the content, you must provide the current or new name.

WORKFLOW:
1. To update content only: Provide id, current name, and new content
2. To update name only: Provide id, new name, and current content
3. To update both: Provide id, new name, and new content

TIP: If you don't know the current name, use getOffer first to retrieve it.`,
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Offer ID to update',
      },
      name: {
        type: 'string',
        description: 'Offer name (REQUIRED - must provide current name even if not changing it)',
      },
      content: {
        type: 'string',
        description: 'Updated offer content (HTML/CSS/JavaScript)',
      },
    },
    required: ['id', 'name'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  const offerUpdate = {
    name: args.name, // Required by API
  };

  if (args.content) {
    offerUpdate.content = args.content;
  }

  return await makeTargetRequest(config, 'PUT', `/target/offers/content/${args.id}`, offerUpdate, 'v2');
}
