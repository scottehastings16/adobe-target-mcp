/**
 * Apply Default Values Helper
 * Utilities for merging user-provided activity/offer values with config defaults
 */

/**
 * Apply default values to an activity object
 * User-provided values always take precedence over defaults
 *
 * @param {Object} activity - User-provided activity object
 * @param {Object} config - Config object with defaults
 * @returns {Object} Activity with defaults applied
 */
export function applyActivityDefaults(activity, config) {
  const { defaults } = config;

  // Apply priority default if not provided
  if (activity.priority === undefined) {
    activity.priority = defaults.priority;
  }

  // Apply workspace default if not provided (and workspace is configured)
  if (!activity.workspace && config.workspaceId) {
    activity.workspace = config.workspaceId;
  }

  // Apply default mboxes if locations.mboxes is empty or not provided
  if (!activity.locations?.mboxes || activity.locations.mboxes.length === 0) {
    activity.locations = activity.locations || {};
    activity.locations.mboxes = defaults.mboxes.map((mboxName, index) => ({
      locationLocalId: index,
      name: mboxName,
      audienceIds: [],
    }));
  }

  // Apply A4T defaults if analytics object is present but incomplete
  if (activity.analytics && defaults.a4t.dataCollectionHost) {
    if (!activity.analytics.dataCollectionHost) {
      activity.analytics.dataCollectionHost = defaults.a4t.dataCollectionHost;
    }

    if (!activity.analytics.reportSuites && defaults.a4t.reportSuites.length > 0) {
      activity.analytics.reportSuites = [
        {
          companyName: defaults.a4t.companyName,
          reportSuites: defaults.a4t.reportSuites,
        },
      ];
    }
  }

  // Apply success metrics defaults if metrics array exists
  if (activity.metrics && Array.isArray(activity.metrics)) {
    activity.metrics = activity.metrics.map((metric) => {
      // If conversion is not explicitly set, default based on metric type
      if (metric.conversion === undefined) {
        metric.conversion = defaults.metricType === 'conversion';
      }

      // If engagement is not set and we're using engagement type, set it
      if (metric.engagement === undefined && defaults.metricType === 'engagement') {
        metric.engagement = defaults.engagementMetric;
      }

      // Apply default action if not provided
      if (!metric.action) {
        metric.action = {
          type: defaults.metricAction,
        };
      } else if (!metric.action.type) {
        metric.action.type = defaults.metricAction;
      }

      // Only apply mbox defaults if this is a conversion metric with mboxes
      if (metric.conversion && metric.mboxes && metric.mboxes.length > 0) {
        metric.mboxes = metric.mboxes.map((mbox) => ({
          name: mbox.name || defaults.successMbox,
          successEvent: mbox.successEvent || defaults.successEvent,
          audienceIds: mbox.audienceIds || [],
        }));
      }

      return metric;
    });
  } else {
    // If no metrics provided at all, create a default engagement metric (page views)
    activity.metrics = [
      {
        metricLocalId: 0,
        name: 'Primary Goal',
        conversion: defaults.metricType === 'conversion',
        engagement: defaults.metricType === 'engagement' ? defaults.engagementMetric : undefined,
        action: {
          type: defaults.metricAction,
        },
      },
    ];

    // If conversion type, add default mbox
    if (defaults.metricType === 'conversion') {
      activity.metrics[0].mboxes = [
        {
          name: defaults.successMbox,
          successEvent: defaults.successEvent,
          audienceIds: [],
        },
      ];
    }
  }

  // Apply entry constraint defaults if present but incomplete
  if (activity.entryConstraint) {
    if (activity.entryConstraint.visitorPercentage === undefined) {
      activity.entryConstraint.visitorPercentage = defaults.visitorPercentage;
    }

    // Apply default mboxes to entry constraint if not provided
    if (!activity.entryConstraint.mboxes || activity.entryConstraint.mboxes.length === 0) {
      activity.entryConstraint.mboxes = defaults.mboxes.map((mboxName) => ({
        name: mboxName,
        audienceIds: [],
      }));
    }
  }

  return activity;
}

/**
 * Get default A4T analytics configuration
 *
 * @param {Object} config - Config object with defaults
 * @returns {Object|null} Analytics object or null if A4T not configured
 */
export function getDefaultA4TConfig(config) {
  const { defaults } = config;

  if (!defaults.a4t.dataCollectionHost || defaults.a4t.reportSuites.length === 0) {
    return null;
  }

  return {
    dataCollectionHost: defaults.a4t.dataCollectionHost,
    reportSuites: [
      {
        companyName: defaults.a4t.companyName,
        reportSuites: defaults.a4t.reportSuites,
      },
    ],
  };
}

/**
 * Get default location (mbox) configuration
 *
 * @param {Object} config - Config object with defaults
 * @param {number} startingLocalId - Starting locationLocalId (default: 0)
 * @returns {Array} Array of mbox location objects
 */
export function getDefaultLocations(config, startingLocalId = 0) {
  const { defaults } = config;

  return defaults.mboxes.map((mboxName, index) => ({
    locationLocalId: startingLocalId + index,
    name: mboxName,
    audienceIds: [],
  }));
}

/**
 * Get default success metric configuration
 *
 * @param {Object} config - Config object with defaults
 * @param {number} metricLocalId - Metric local ID
 * @param {string} metricName - Metric display name
 * @returns {Object} Metric object with defaults applied
 */
export function getDefaultMetric(config, metricLocalId, metricName) {
  const { defaults } = config;

  const metric = {
    metricLocalId,
    name: metricName,
    conversion: defaults.metricType === 'conversion',
    action: {
      type: defaults.metricAction,
    },
  };

  // Add engagement metric if using engagement type
  if (defaults.metricType === 'engagement') {
    metric.engagement = defaults.engagementMetric;
  }

  // Add mbox tracking if using conversion type
  if (defaults.metricType === 'conversion') {
    metric.mboxes = [
      {
        name: defaults.successMbox,
        successEvent: defaults.successEvent,
        audienceIds: [],
      },
    ];
  }

  return metric;
}

/**
 * Get default entry constraint configuration
 *
 * @param {Object} config - Config object with defaults
 * @returns {Object} Entry constraint object
 */
export function getDefaultEntryConstraint(config) {
  const { defaults } = config;

  return {
    mboxes: defaults.mboxes.map((mboxName) => ({
      name: mboxName,
      audienceIds: [],
    })),
    visitorPercentage: defaults.visitorPercentage,
  };
}
