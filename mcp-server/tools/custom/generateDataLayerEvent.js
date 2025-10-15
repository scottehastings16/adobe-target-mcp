/**
 * Generate DataLayer Event Tool
 * Generate standardized dataLayer event code for Target activity conversion tracking
 * Supports multiple tag managers: GTM, Adobe Launch, Tealium, Segment, and custom implementations
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load configurations
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tagManagerConfigPath = join(__dirname, '..', '..', 'config', 'tag-managers.json');
const firingConditionsConfigPath = join(__dirname, '..', '..', 'config', 'firing-conditions.json');
let tagManagerConfigs = {};
let firingConditionsConfig = {};

try {
  const tagManagerData = readFileSync(tagManagerConfigPath, 'utf-8');
  tagManagerConfigs = JSON.parse(tagManagerData);
} catch (error) {
  console.error('[generateDataLayerEvent] Failed to load tag manager configs:', error.message);
}

try {
  const firingConditionsData = readFileSync(firingConditionsConfigPath, 'utf-8');
  firingConditionsConfig = JSON.parse(firingConditionsData);
} catch (error) {
  console.error('[generateDataLayerEvent] Failed to load firing conditions configs:', error.message);
}

export const tool = {
  name: 'generateDataLayerEvent',
  description: `Generate ES5-compatible event tracking code for Adobe Target activity conversions.
Supports multiple tag managers with configurable event structures and firing conditions.

SUPPORTED TAG MANAGERS:
- gtm: Google Tag Manager (dataLayer.push)
- adobeLaunch: Adobe Experience Platform Tags (_satellite.track)
- tealium: Tealium iQ (utag.link)
- segment: Segment Analytics (analytics.track)
- customDataLayer: Custom dataLayer implementation

USAGE:
When creating or modifying Target experiences with conversion elements (buttons, links, forms), use this tool to generate click tracking code.

WORKFLOW:
1. User creates an experience with a button/link/conversion element
2. LLM identifies the conversion element selector
3. LLM asks: "What should I name this activity?" (if not already provided)
4. LLM asks: "What experience name should I use?" (e.g., "Experience A", "Control", "Variant B")
5. LLM asks: "Which tag manager are you using?" (default: gtm)
6. **LLM MUST ASK**: "When should this conversion event fire?" and present these options:

   **1. Every time (no limit)** - Track every interaction
   **2. Once per session** ⭐ RECOMMENDED for conversions - Track only once per session
   **3. Once per page** - Track only once per page load
   **4. Once ever** - Track only once, stored permanently
   **5. Throttle** - Limit frequency (e.g., max once per second)
   **6. Debounce** - Wait for user to stop interacting

   For conversion tracking, STRONGLY recommend "once_per_session" to prevent duplicate conversions.

7. LLM calls this tool with selector, activity_name, experience_name, tag_manager, and firing_condition
8. Tool returns ES5-compatible click event listener code with firing condition logic
9. LLM includes this code in the activity modifications

FIRING CONDITIONS:
- always: No limit, fires every time
- once_per_session: Fires once per session (uses sessionStorage) - BEST FOR CONVERSIONS
- once_per_page: Fires once per page load (uses flag)
- once_ever: Fires once ever (uses localStorage)
- throttle: Limits frequency (requires interval parameter in ms)
- debounce: Waits for user to stop (requires delay parameter in ms)

IMPORTANT:
- ALWAYS ask about firing conditions - don't assume
- For conversion tracking, default to "once_per_session" if user is unsure
- Attach to ALL conversion elements (buttons, CTAs, forms, etc.)
- activity_name should match the Target activity name
- experience_name should be descriptive (e.g., "Control", "Variant A", "Green Button Test")
- Generated code is ES5-compatible (no template literals, arrow functions, const/let)
- Code includes defensive check for element and tag manager object existence
- NO polling/setInterval - Target fires after DOM ready, so elements should already exist`,
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector for the conversion element (button, link, etc.) - e.g., "#cta-button", ".at-signup-btn"',
      },
      activity_name: {
        type: 'string',
        description: 'The name of the Adobe Target activity (should match activity name in Target)',
      },
      experience_name: {
        type: 'string',
        description: 'The experience name/variant (e.g., "Experience A", "Control", "Variant B", "Green Button")',
      },
      tag_manager: {
        type: 'string',
        description: 'Tag manager to use: "gtm" (Google Tag Manager), "adobeLaunch" (Adobe Launch), "tealium" (Tealium iQ), "segment" (Segment), or "customDataLayer" (Custom implementation). Default: "gtm"',
        enum: ['gtm', 'adobeLaunch', 'tealium', 'segment', 'customDataLayer'],
      },
      firing_condition: {
        type: 'string',
        description: 'When should the event fire? Options: "always" (every time), "once_per_session" (recommended for conversions), "once_per_page", "once_ever", "throttle", "debounce". Default: "once_per_session"',
        enum: ['always', 'once_per_session', 'once_per_page', 'once_ever', 'throttle', 'debounce'],
      },
      firing_params: {
        type: 'object',
        description: 'Parameters for throttle/debounce conditions. For throttle: { interval: 1000 }. For debounce: { delay: 500 }. Values in milliseconds.',
        properties: {
          interval: {
            type: 'number',
            description: 'For throttle: minimum time between events in milliseconds'
          },
          delay: {
            type: 'number',
            description: 'For debounce: time to wait after last interaction in milliseconds'
          }
        }
      },
      event_name: {
        type: 'string',
        description: 'Custom event name (optional). If not provided, uses tag manager default (e.g., "target_conversion" for GTM, "target-conversion" for Adobe Launch)',
      },
      event_type: {
        type: 'string',
        description: 'Type of DOM event to track (default: "click"). Can be "click", "submit", "change", etc.',
      },
      include_comments: {
        type: 'boolean',
        description: 'Include explanatory comments in the generated code (default: true)',
      },
    },
    required: ['selector', 'activity_name', 'experience_name'],
  },
};

export async function handler(args, context) {
  const {
    selector,
    activity_name,
    experience_name,
    tag_manager = 'gtm',
    firing_condition = 'once_per_session',
    firing_params = {},
    event_name,
    event_type = 'click',
    include_comments = true
  } = args;

  // Validate tag manager
  const config = tagManagerConfigs[tag_manager];
  if (!config) {
    return {
      success: false,
      error: 'Invalid tag_manager: "' + tag_manager + '"',
      availableTagManagers: Object.keys(tagManagerConfigs),
      suggestion: 'Use one of the available tag managers: ' + Object.keys(tagManagerConfigs).join(', ')
    };
  }

  // Validate firing condition
  const firingConditions = firingConditionsConfig.firingConditions || {};
  const firingConditionConfig = firingConditions[firing_condition];
  if (!firingConditionConfig) {
    return {
      success: false,
      error: 'Invalid firing_condition: "' + firing_condition + '"',
      availableFiringConditions: Object.keys(firingConditions),
      suggestion: 'Use one of the available firing conditions: ' + Object.keys(firingConditions).join(', ')
    };
  }

  // Validate params for throttle/debounce
  if (firingConditionConfig.requiresParams) {
    const paramKeys = Object.keys(firingConditionConfig.params);
    for (const key of paramKeys) {
      if (!firing_params[key]) {
        firing_params[key] = firingConditionConfig.params[key].default;
      }
    }
  }

  // Use custom event name or default from config
  const finalEventName = event_name || config.eventStructure.defaultEventName;

  // Generate tag manager-specific tracking code
  const code = generateTagManagerTrackingCode(
    selector,
    activity_name,
    experience_name,
    finalEventName,
    event_type,
    include_comments,
    config,
    firing_condition,
    firingConditionConfig,
    firing_params
  );

  return {
    success: true,
    tagManager: config.name,
    firingCondition: firingConditionConfig.name,
    selector,
    activity_name,
    experience_name,
    event_name: finalEventName,
    event_type,
    code,
    example: config.example,
    instructions: [
      config.name + ' conversion tracking code generated successfully',
      '',
      'WHAT THIS DOES:',
      '- Checks if element exists (defensive coding)',
      '- Attaches a ' + event_type + ' event listener to: ' + selector,
      '- Firing Condition: ' + firingConditionConfig.name,
      '- ' + firingConditionConfig.userDescription,
      '- Fires ' + config.eventObject + '.' + config.method + '() when user interacts with the element',
      '- Tracks activity: "' + activity_name + '"',
      '- Tracks experience: "' + experience_name + '"',
      '- Event name: "' + finalEventName + '"',
      '',
      'HOW TO USE THIS CODE:',
      '1. Include this code in your Target activity modifications',
      '2. Place it AFTER your DOM modifications (button creation/styling)',
      '3. The event will fire when users click/interact with the element',
      '4. Ensure ' + config.eventObject + ' is available on the page',
      '5. Firing behavior: ' + firingConditionConfig.name,
      '',
      'EXAMPLE FULL ACTIVITY CODE:',
      '(function() {',
      '  // 1. Modify the button (defensive check)',
      '  var button = document.querySelector("' + selector + '");',
      '  if (button) {',
      '    // Your modifications',
      '    button.style.backgroundColor = "green";',
      '    button.textContent = "Get Started Now";',
      '  }',
      '',
      '  // 2. Attach conversion tracking (' + firingConditionConfig.name + ')',
      code.split('\n').map(line => '  ' + line).join('\n'),
      '})();',
    ],
    verificationSteps: getVerificationSteps(tag_manager, selector, activity_name, experience_name, finalEventName, config, firingConditionConfig),
  };
}

/**
 * Generate tag manager-specific tracking code from config template
 * NO template literals - uses string concatenation only
 * NO polling/setInterval - Target fires after DOM ready
 */
function generateTagManagerTrackingCode(selector, activityName, experienceName, eventName, eventType, includeComments, config, firingCondition, firingConditionConfig, firingParams) {
  const comments = includeComments
    ? '// Attach conversion tracking to: ' + selector + '\n// Fires on ' + eventType + ' event\n// Tag Manager: ' + config.name + '\n// Firing Condition: ' + firingConditionConfig.name + '\n'
    : '';

  // Replace template placeholders with actual values for tracking code
  let trackingCode = config.template
    .replace(/\{\{EVENT_KEY\}\}/g, config.eventStructure.eventKey)
    .replace(/\{\{EVENT_NAME\}\}/g, eventName)
    .replace(/\{\{ACTIVITY_KEY\}\}/g, config.eventStructure.activityKey)
    .replace(/\{\{ACTIVITY_NAME\}\}/g, activityName)
    .replace(/\{\{EXPERIENCE_KEY\}\}/g, config.eventStructure.experienceKey)
    .replace(/\{\{EXPERIENCE_NAME\}\}/g, experienceName);

  // Indent tracking code for wrapping inside firing condition
  const indentedTrackingCode = trackingCode.split('\n').map(line => '  ' + line).join('\n');

  // Generate unique key for this tracking instance (based on selector and activity)
  const uniqueKey = activityName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + selector.replace(/[^a-zA-Z0-9]/g, '_');

  // Wrap tracking code with firing condition
  let conditionWrappedCode = firingConditionConfig.template
    .replace(/\{\{TRACKING_CODE\}\}/g, indentedTrackingCode)
    .replace(/\{\{UNIQUE_KEY\}\}/g, uniqueKey)
    .replace(/\{\{INTERVAL\}\}/g, firingParams.interval || 1000)
    .replace(/\{\{DELAY\}\}/g, firingParams.delay || 500);

  // Wrap in element selector and event listener (ES5-compatible)
  const code = comments + 'var element = document.querySelector(\'' + selector + '\');\n' +
    'if (element) {\n' +
    '  // Attach ' + eventType + ' event listener for conversion tracking\n' +
    '  element.addEventListener(\'' + eventType + '\', function() {\n' +
    '    ' + conditionWrappedCode.split('\n').join('\n    ') + '\n' +
    '  });\n' +
    '}';

  return code;
}

/**
 * Get verification steps based on tag manager
 */
function getVerificationSteps(tagManager, selector, activityName, experienceName, eventName, config, firingConditionConfig) {
  const steps = [
    'To verify tracking works:',
    '1. Deploy the activity',
    '2. Open browser console',
    '3. Click the element: ' + selector,
    '4. Note: Firing condition is "' + firingConditionConfig.name + '" - ' + firingConditionConfig.userDescription,
  ];

  switch (tagManager) {
    case 'gtm':
      steps.push('5. Check console for dataLayer event:');
      steps.push('   > dataLayer');
      steps.push('   Should show: {' + config.eventStructure.eventKey + ': "' + eventName + '", ' + config.eventStructure.activityKey + ': "' + activityName + '", ' + config.eventStructure.experienceKey + ': "' + experienceName + '"}');
      steps.push('');
      steps.push('GTM Verification:');
      steps.push('1. Use GTM Preview mode');
      steps.push('2. Click the tracked element');
      steps.push('3. Look for "' + eventName + '" event in GTM timeline');
      steps.push('4. Verify ' + config.eventStructure.activityKey + ' and ' + config.eventStructure.experienceKey + ' values');
      break;

    case 'adobeLaunch':
      steps.push('5. Check console for _satellite object:');
      steps.push('   > _satellite');
      steps.push('   Should be defined (Adobe Launch is loaded)');
      steps.push('');
      steps.push('Adobe Launch Verification:');
      steps.push('1. Enable Launch debugging: _satellite.setDebug(true)');
      steps.push('2. Click the tracked element');
      steps.push('3. Check console for direct call rule: "' + eventName + '"');
      steps.push('4. Verify data: {' + config.eventStructure.activityKey + ': "' + activityName + '", ' + config.eventStructure.experienceKey + ': "' + experienceName + '"}');
      break;

    case 'tealium':
      steps.push('5. Check console for utag object:');
      steps.push('   > utag');
      steps.push('   Should be defined (Tealium is loaded)');
      steps.push('');
      steps.push('Tealium Verification:');
      steps.push('1. Use Tealium Developer Tools browser extension');
      steps.push('2. Click the tracked element');
      steps.push('3. Check for link event with: {' + config.eventStructure.eventKey + ': "' + eventName + '", ' + config.eventStructure.activityKey + ': "' + activityName + '"}');
      break;

    case 'segment':
      steps.push('5. Check console for analytics object:');
      steps.push('   > analytics');
      steps.push('   Should be defined (Segment is loaded)');
      steps.push('');
      steps.push('Segment Verification:');
      steps.push('1. Use Segment Debugger');
      steps.push('2. Click the tracked element');
      steps.push('3. Look for track event: "' + eventName + '"');
      steps.push('4. Verify properties: {' + config.eventStructure.activityKey + ': "' + activityName + '", ' + config.eventStructure.experienceKey + ': "' + experienceName + '"}');
      break;

    case 'customDataLayer':
      steps.push('5. Check console for customDataLayer:');
      steps.push('   > window.customDataLayer');
      steps.push('   Should show: [{' + config.eventStructure.eventKey + ': "' + eventName + '", ' + config.eventStructure.activityKey + ': "' + activityName + '", ' + config.eventStructure.experienceKey + ': "' + experienceName + '"}]');
      break;
  }

  return steps;
}
