/**
 * Create Response Token Tool
 * Create a new response token
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createResponseToken',
  description: `Create a NEW CUSTOM response token to include data in Adobe Target activity responses.

IMPORTANT: This tool creates NEW custom tokens only. Many common tokens already exist in your account:
- System tokens (experience.id, activity.name, geo.city, etc.) already exist with deletable: false
- These existing tokens can only be ACTIVATED/DEACTIVATED in the Target UI (Administration > Response Tokens)
- Use this tool to create NEW custom tokens that don't already exist

To check existing tokens, use listResponseTokens first.

Response tokens make additional data available in Target's response payload (mbox.js, at.js).

TOKEN TYPES (for creating NEW tokens):

1. BUILT_IN - System-level tokens (e.g., experience.id, activity.name)
   Example: { token: "experience.id", type: "BUILT_IN" }

2. ACTIVITY - Activity-based attributes (e.g., activity.name, campaign.id)
   Example: { token: "activity.name", type: "ACTIVITY" }

3. GEO - Geographic data (e.g., geo.city, geo.country)
   Example: { token: "geo.city", type: "GEO" }

4. CRS - Customer Record Service attributes
   Example: { token: "crs.customAttribute", type: "CRS" }

5. MBOX - Custom mbox parameters passed in requests (MOST COMMON FOR NEW TOKENS)
   Example: { token: "profile.userType", type: "MBOX" }
   Example: { token: "profile.productId", type: "MBOX" }
   Note: Mbox parameters must be passed by your implementation (at.js/mobile SDK)
   This is the most common type for creating custom response tokens

6. SCRIPT - Profile script outputs (e.g., profile.scriptName)
   Example: { token: "profile.userSegment", type: "SCRIPT" }

    IMPORTANT LIMITATION:
   Profile scripts CANNOT be created via the Admin API.
   You must create profile scripts in the Target UI first:
   - Navigate to Audiences > Profile Scripts
   - Create your script (e.g., "userSegment")
   - Then create the response token: { token: "profile.userSegment", type: "SCRIPT" }

COMMON USE CASES FOR CUSTOM TOKENS:

Custom tracking: Create tokens for your specific mbox parameters (profile.userType, profile.campaignId, etc.)
Business data: Return custom business attributes in responses
Integration: Pass custom data to analytics or tag management systems

BEFORE CREATING:
1. Run listResponseTokens to check if the token already exists
2. If it exists with deletable: false, activate it in Target UI instead
3. If it doesn't exist, create it with this tool

WORKFLOW FOR SCRIPT TOKENS:
1. Create profile script in Target UI (Audiences > Profile Scripts)
2. Use this tool to create response token referencing that script
3. Response token becomes available in Target responses`,
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Response token ID (optional)',
      },
      token: {
        type: 'string',
        description: 'Token identifier (e.g., "experience.id", "profile.scriptName", "geo.city")',
      },
      type: {
        type: 'string',
        enum: ['BUILT_IN', 'ACTIVITY', 'GEO', 'CRS', 'MBOX', 'SCRIPT'],
        description: 'Token type - see description for details and limitations',
      },
    },
    required: ['token', 'type'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  const tokenData = {
    token: args.token,
    type: args.type,
  };

  if (args.id !== undefined) {
    tokenData.id = args.id;
  }

  return await makeTargetRequest(config, 'POST', '/target/responsetokens', tokenData, 'v1');
}
