/**
 * Update AB Activity Tool
 * Update an existing A/B Test activity definition
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';
import { applyActivityDefaults } from '../../helpers/applyDefaults.js';

export const tool = {
  name: 'updateABActivity',
  description: `Update an existing A/B Test activity definition. This can change the state, behavior, and configuration of an existing activity.

DEFAULT VALUES:
This tool automatically applies default values from your configuration for any missing fields:
- priority: Defaults to ${process.env.TARGET_DEFAULT_PRIORITY || '5'}
- workspace: Uses TARGET_WORKSPACE_ID if configured
- analytics (A4T): Auto-fills dataCollectionHost and reportSuites if configured
- metrics defaults: action type, success mboxes, etc.

You can override any default by explicitly providing the value.

USE CASES:
- Modify activity name, priority, or configuration
- Update experiences, locations, or metrics
- Change activity state (saved, approved, deactivated)
- Update dates (startsAt, endsAt)
- Modify audience targeting or reporting audiences

NOTE: For ONLY changing activity state (saved/approved/deactivated), use updateActivityState tool instead.
This tool is for full activity definition updates.

ACTIVITY STATES:
- saved: Inactive state (for draft activities)
- approved: Activity is live (requires startsAt and endsAt dates)
- deactivated: Archived
- deleted: Removed from UI

STATE BEHAVIOR WITH DATES (when state is "approved"):
- startsAt in past + endsAt in future = Live
- startsAt in past + endsAt in past = Ended
- startsAt in future + endsAt in future = Scheduled

IMPORTANT NOTES:
- 15-minute latency between API and UI
- Activity stays in API-set state even if UI status changes (e.g., if you set to "approved" and end date passes, UI shows "Ended" but state remains "approved")
- Workspace ID required for premium customers (must have "approver" privilege)
- Provide complete activity object - this is a PUT request that replaces the existing definition

TYPICAL UPDATE STRUCTURE:
{
  "id": 123456,
  "name": "Updated Activity Name",
  "state": "saved" | "approved",
  "priority": 5,
  "startsAt": "2024-01-01T00:00:00Z", // required if state is "approved"
  "endsAt": "2024-12-31T23:59:59Z",   // required if state is "approved"
  "locations": {
    "mboxes": [
      {
        "name": "target-global-mbox",
        "experiences": [...]
      }
    ]
  },
  "experiences": [...],
  "metrics": [...],
  "workspace": "workspaceId" // for premium customers
}

OPTIONAL FIELDS:
- entryConstraint (visitor percentage, mbox constraints)
- reportingAudiences
- analytics (A4T integration)
- propertyIds
- views (for SPA)
- applicationContext (channel, device type, etc.)`,
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Activity ID',
      },
      activity: {
        type: 'object',
        description: 'Complete updated activity definition object (PUT request - replaces existing definition)',
      },
    },
    required: ['id', 'activity'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  // Apply default values to activity (user values take precedence)
  const activityWithDefaults = applyActivityDefaults({ ...args.activity }, config);

  return await makeTargetRequest(config, 'PUT', `/target/activities/ab/${args.id}`, activityWithDefaults, 'v3');
}
