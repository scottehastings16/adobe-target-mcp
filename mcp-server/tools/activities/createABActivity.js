/**
 * Create AB Activity Tool
 * Create a new A/B Test activity
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';
import { applyActivityDefaults } from '../../helpers/applyDefaults.js';

export const tool = {
  name: 'createABActivity',
  description: `WARNING: ADVANCED/PROGRAMMATIC USE ONLY - API-CREATED ACTIVITIES CANNOT BE EDITED IN UI

Activities created via Admin API are LOCKED and cannot be edited in Adobe Target UI.

DO NOT USE THIS TOOL FOR NORMAL WORKFLOW
Instead: Use createOffer to generate offers → User builds activity in Target UI

ONLY use this tool for:
- Bulk programmatic activity creation
- Automated CI/CD workflows
- Activities that will never need UI editing

For normal development: See createOffer tool documentation

AUTO-FILLED DEFAULTS:
- priority: ${process.env.TARGET_DEFAULT_PRIORITY || '5'}
- workspace: TARGET_WORKSPACE_ID
- locations.mboxes: ${process.env.TARGET_DEFAULT_MBOXES || 'target-global-mbox'}
- metrics: Page views goal (engagement: "page_count")
- analytics (A4T): Auto-configured if set in .env

ACTIVITY MUST INCLUDE:
- name (string)
- state: "saved" (always use saved, activate later with updateActivityState)
- options: Array with offerIds from createOffer
- experiences: Traffic split configuration
- locations: Where activity runs (auto-filled if not provided)
- metrics: Success goal (auto-filled page views if not provided)

REFERENCE - Complete Payload Structure:
{
  "id": 0,                             // int64: Activity ID (optional for create, auto-generated)
  "thirdPartyId": "string",            // string: Optional external ID reference
  "name": "string",                    // string: REQUIRED - Activity name
  "state": "saved",                    // string: REQUIRED - "approved" | "saved" | "deactivated" | "deleted"
                                       // ALWAYS use "saved" for new activities
  "priority": 5,                       // int32: REQUIRED - Default: 5, Range: 0-999
  "startsAt": "2024-01-01T00:00:00Z",  // string (ISO-8601): Required if state is "approved"
  "endsAt": "2024-12-31T23:59:59Z",    // string (ISO-8601): Required if state is "approved"
  "modifiedAt": "2024-01-01T00:00:00Z", // string (ISO-8601): Auto-generated timestamp

  // LOCATIONS - Define where activity runs
  "locations": {
    "mboxes": [                        // array: For server-side/mbox-based activities
      {
        "locationLocalId": 0,          // int32: Unique ID for this location
        "name": "target-global-mbox",  // string: Mbox name
        "audienceIds": []              // array<int64>: Optional audience targeting for location
      }
    ],
    "selectors": [                     // array: For SPA/VEC activities with CSS selectors
      {
        "locationLocalId": 0,          // int32: Unique ID for this location
        "name": "Hero Selector",       // string: Display name
        "selector": "#hero-section",   // string: CSS selector
        "audienceIds": [],             // array<int64>: Optional audience targeting
        "selectorVersion": 1,          // int32: Selector version
        "viewLocalId": 0               // int32: Reference to view (for SPA)
      }
    ]
  },

  // OPTIONS - Define what content variations to show
  "options": [
    {
      "optionLocalId": 0,              // int32: Unique ID for this option
      "name": "Option A",              // string: Option display name
      "offerId": 123456,               // int64: ID from createOffer or existing offer
      "offerTemplates": [              // array: Optional - For dynamic offer templates
        {
          "offerTemplateId": 0,        // int64: Template ID
          "templateParameters": [      // array: Template parameters
            {
              "name": "paramName",     // string: Parameter name
              "value": "paramValue"    // string: Parameter value
            }
          ]
        }
      ]
    }
  ],

  // EXPERIENCES - Map options to locations with traffic allocation
  "experiences": [
    {
      "experienceLocalId": 0,          // int32: Unique ID for this experience
      "name": "Experience A (Control)", // string: Experience display name
      "audienceIds": [],               // array<int64>: Optional audience targeting
      "visitorPercentage": 50,         // int32: Traffic allocation (must total 100%)
      "optionLocations": [             // array: Map options to locations
        {
          "locationLocalId": 0,        // int32: Reference to location
          "optionLocalId": 0           // int32: Reference to option
        }
      ]
    },
    {
      "experienceLocalId": 1,
      "name": "Experience B",
      "audienceIds": [],
      "visitorPercentage": 50,
      "optionLocations": [
        {
          "locationLocalId": 0,
          "optionLocalId": 1
        }
      ]
    }
  ],

  // METRICS - Define success metrics (conversions, engagement)
  "metrics": [
    {
      "metricLocalId": 0,              // int32: Unique ID for this metric
      "name": "Primary Goal",          // string: Metric display name
      "conversion": true,              // boolean: true for conversion metric
      "engagement": "page_count",      // string: "page_count" | "score" | "time_on_site" | "none"

      // Action configuration (how to count metric)
      "action": {
        "type": "count_once",          // string: How to count this metric
        // Valid types:
        // "count_once" - Count only once per visitor
        // "count_landings" - Count each landing
        // "always_convert" - Always count as conversion
        // "restart_same_experience" - Restart in same experience
        // "restart_random_experience" - Restart in random experience
        // "restart_new_experience" - Restart in new experience
        // "exclude_to_same_experience" - Exclude but keep in same experience
        // "ban_from_campaign" - Permanently exclude from activity

        "conditions": {                // object: When to count
          "maxVisitCount": 0,          // int32: Max visits before counting (0 = unlimited)
          "maxImpressionCount": 0,     // int32: Max impressions before counting
          "experiences": [             // Per-experience conditions
            {
              "experienceLocalId": 0,  // int32: Reference to experience
              "maxVisitCount": 0,      // int32: Max visits for this experience
              "maxImpressionCount": 0  // int32: Max impressions for this experience
            }
          ]
        },
        "onConditionsMetAction": "count_once"  // string: Same values as "type"
      },

      // Mbox-based success tracking
      "mboxes": [
        {
          "name": "orderConfirmPage",   // string: Mbox name
          "successEvent": "mbox_shown", // string: "mbox_shown" | "mbox_clicked"
          "audienceIds": []              // array<int64>: Optional audience segmentation
        }
      ],

      // Click tracking (alternative to mbox tracking)
      "clickTrackSelectors": [
        {
          "selector": "#buy-button",   // string: CSS selector to track
          "audienceIds": [],           // array<int64>: Optional audience segmentation
          "selectorVersion": 1,        // int32: Selector version
          "viewLocalId": 0             // int32: Reference to view (for SPA)
        }
      ],

      // View-based tracking (for SPA)
      "views": [
        {
          "viewLocalId": 0,            // int32: Reference to view
          "audienceIds": []            // array<int64>: Optional audience segmentation
        }
      ],

      // Per-metric A4T configuration (overrides activity-level)
      "analytics": {
        "dataCollectionHost": "company.sc.omtrdc.net",
        "reportSuites": [
          {
            "companyName": "Company",
            "reportSuites": ["prod-rsid"]
          }
        ]
      }
    }
  ],

  // OPTIONAL: Entry constraints (limit who can enter)
  "entryConstraint": {
    "mboxes": [                        // Require specific mboxes to fire
      {
        "name": "target-global-mbox",
        "audienceIds": []              // Optional audience constraints
      }
    ],
    "visitorPercentage": 100           // Limit % of visitors (default: 100)
  },

  // OPTIONAL: Reporting audiences (segment reports)
  "reportingAudiences": [
    {
      "reportingAudienceLocalId": 0,   // int32: Unique ID for this reporting audience
      "audienceId": 789,               // int64: Reference to audience
      "metricLocalId": 0               // int32: Reference to metric
    }
  ],

  // OPTIONAL: Analytics for Target (A4T) integration
  "analytics": {
    "dataCollectionHost": "company.sc.omtrdc.net", // string: Analytics tracking server
    "reportSuites": [                  // array: Report suite configuration
      {
        "companyName": "Company",      // string: Analytics company name
        "reportSuites": ["prod-rsid"]  // array<string>: Report suite IDs
      }
    ]
  },

  // OPTIONAL: For premium customers
  "workspace": "1234567",              // string: Workspace ID (max 250 chars)
  "propertyIds": [123],                // array<int64>: Unique property IDs

  // OPTIONAL: For SPA/single-page applications
  "views": [
    {
      "viewLocalId": 0,                // int32: Local ID for this view
      "viewId": 1001,                  // int64: Global view ID
      "audienceIds": []                // array<int64>: Optional audience targeting
    }
  ],

  // OPTIONAL: Application context (mobile, channel)
  "applicationContext": {
    "channel": "web",                  // string: "web" | "mobile"
    "applicationVersions": ["1.0"],    // array<string>: App version numbers
    "mobilePlatformVersions": ["iOS 16"], // array<string>: OS versions
    "deviceType": "phone",             // string: "phone" | "tablet" | "desktop"
    "screenOrientation": "portrait"    // string: "portrait" | "landscape"
  }
}

See full API documentation for complete field reference.

 REMINDER: For normal use cases, create offers with createOffer tool instead of using this advanced API.`,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Activity name',
      },
      activity: {
        type: 'object',
        description: 'Full A/B Test activity definition object with locations, experiences, metrics, and optional fields',
      },
    },
    required: ['name', 'activity'],
  },
};

export async function handler(args, context) {
  const { config } = context;

  // Apply default values to activity (user values take precedence)
  const activityWithDefaults = applyActivityDefaults({ ...args.activity }, config);

  return await makeTargetRequest(config, 'POST', '/target/activities/ab', activityWithDefaults, 'v3');
}
