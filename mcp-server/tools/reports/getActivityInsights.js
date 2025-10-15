/**
 * Get Activity Insights by Name
 * Search for an activity by name, retrieve its performance report, and provide insights comparing experiences
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'getActivityInsights',
  description: 'Search for an activity by name and get a detailed performance comparison of all experiences with insights and recommendations. No activity ID needed - just provide the activity name.',
  inputSchema: {
    type: 'object',
    properties: {
      activityName: {
        type: 'string',
        description: 'Name of the activity (can be partial match)',
      },
      reportInterval: {
        type: 'string',
        description: 'Optional date range in ISO 8601 format (e.g., "2024-01-01T00:00-07:00/2024-02-01T00:00-07:00")',
      },
      qaUrl: {
        type: 'string',
        description: 'Optional URL for generating QA preview links (e.g., "https://www.example.com"). If not provided, QA links will not be generated.',
      },
    },
    required: ['activityName'],
  },
};

/**
 * Calculate conversion rate
 */
function calculateConversionRate(entries, conversions) {
  if (entries === 0) return 0;
  return (conversions / entries) * 100;
}

/**
 * Calculate lift percentage
 */
function calculateLift(controlRate, variantRate) {
  if (controlRate === 0) return 0;
  return ((variantRate - controlRate) / controlRate) * 100;
}

/**
 * Format experience comparison
 */
function formatExperienceComparison(experiences, statistics, activityType, qaLinks = null) {
  const comparisons = [];

  // Only A/B tests have a "control" concept
  const hasControl = activityType === 'ab';

  // Get control (first experience) - only for A/B tests
  const control = statistics.experiences[0];
  const controlConversionRate = calculateConversionRate(
    control.totals.visitor.totals.entries,
    control.totals.visitor.totals.conversions
  );

  experiences.forEach((exp, idx) => {
    const stats = statistics.experiences[idx];
    const conversionRate = calculateConversionRate(
      stats.totals.visitor.totals.entries,
      stats.totals.visitor.totals.conversions
    );

    // Only calculate lift for A/B tests
    const lift = hasControl && idx > 0 ? calculateLift(controlConversionRate, conversionRate) : 0;

    const comparison = {
      experienceName: exp.name || `Experience ${String.fromCharCode(65 + idx)}`,
      experienceId: exp.experienceLocalId,
      isControl: hasControl && idx === 0,
      metrics: {
        visitors: stats.totals.visitor.totals.entries,
        conversions: stats.totals.visitor.totals.conversions,
        conversionRate: conversionRate.toFixed(2) + '%',
        visits: stats.totals.visit.totals.entries,
        impressions: stats.totals.impression.totals.entries,
        landings: stats.totals.landing.totals.entries,
      },
    };

    // Only add performance/lift data for A/B tests with variants
    if (hasControl && idx > 0) {
      comparison.performance = {
        lift: lift.toFixed(2) + '%',
        isWinning: lift > 0,
      };
    }

    // Add QA link if available
    if (qaLinks) {
      const qaLink = qaLinks.find(qa => qa.experienceLocalId === exp.experienceLocalId);
      if (qaLink) {
        comparison.qaUrl = qaLink.url;
      }
    }

    comparisons.push(comparison);
  });

  return comparisons;
}

/**
 * Get activity type information
 */
function getActivityTypeInfo(activityType) {
  const typeInfo = {
    ab: {
      name: 'A/B Test',
      description: 'Randomly splits traffic between experiences to test which performs best',
      comparisonNote: 'Experiences are randomly distributed - comparing statistical performance',
    },
    xt: {
      name: 'Experience Targeting',
      description: 'Shows different experiences to different audience segments',
      comparisonNote: 'Experiences are targeted to specific audiences - not random distribution',
    },
    abt: {
      name: 'Automated Personalization',
      description: 'Uses machine learning to automatically show the best experience to each visitor',
      comparisonNote: 'Algorithm-driven personalization - performance varies by visitor attributes',
    },
  };

  return typeInfo[activityType] || {
    name: activityType.toUpperCase(),
    description: 'Unknown activity type',
    comparisonNote: 'Performance comparison',
  };
}

/**
 * Generate insights and recommendations based on activity type
 */
function generateInsights(comparisons, activity) {
  const insights = [];
  const recommendations = [];
  const typeInfo = getActivityTypeInfo(activity.type);

  // Add activity type context
  insights.push(`📊 Activity Type: ${typeInfo.name}`);
  insights.push(`ℹ️ ${typeInfo.description}`);

  // Find best performing experience
  const sortedByConversion = [...comparisons].sort((a, b) => {
    return parseFloat(b.metrics.conversionRate) - parseFloat(a.metrics.conversionRate);
  });

  const winner = sortedByConversion[0];
  const control = comparisons[0];
  const totalVisitors = comparisons.reduce((sum, exp) => sum + exp.metrics.visitors, 0);

  // Activity type-specific insights
  if (activity.type === 'ab') {
    // A/B Test specific insights
    if (comparisons.length === 1) {
      insights.push('⚠️ Only one experience found. A/B tests typically have 2+ experiences to compare.');
      recommendations.push('Add additional experiences (variants) to test against the control.');
    } else {
      if (winner.experienceId !== control.experienceId) {
        insights.push(`🏆 Winner: ${winner.experienceName} with ${winner.metrics.conversionRate} conversion rate (${winner.performance.lift} lift)`);

        if (totalVisitors >= 1000) {
          recommendations.push(`Strong results with ${totalVisitors} visitors. Consider implementing ${winner.experienceName} site-wide.`);
        } else if (totalVisitors >= 100) {
          recommendations.push(`Promising trend with ${totalVisitors} visitors. Continue testing to confirm statistical significance.`);
        }
      } else {
        insights.push(`The control (${control.experienceName}) is currently the best performer.`);
        insights.push('Variants are not outperforming the control.');
        recommendations.push('Consider testing more aggressive variations or different hypotheses.');
      }

      // Check traffic distribution for A/B tests
      const trafficImbalance = comparisons.some(exp => {
        const avgVisitors = totalVisitors / comparisons.length;
        return Math.abs(exp.metrics.visitors - avgVisitors) > avgVisitors * 0.2;
      });

      if (trafficImbalance && totalVisitors > 100) {
        insights.push('⚠️ Traffic split is uneven across experiences.');
        recommendations.push('Verify traffic allocation settings (should typically be 50/50 or evenly split).');
      }
    }
  } else if (activity.type === 'xt') {
    // Experience Targeting specific insights
    insights.push(`📌 Note: ${typeInfo.comparisonNote}`);

    if (comparisons.length === 1) {
      insights.push('⚠️ Only one experience found. XT activities typically target multiple audience segments.');
      recommendations.push('Add experiences targeted to different audience segments to maximize personalization.');
    } else {
      insights.push(`${comparisons.length} targeted experiences are active.`);

      // Show which experiences are performing well
      comparisons.forEach((exp, idx) => {
        if (exp.metrics.visitors > 0) {
          insights.push(`  • ${exp.experienceName}: ${exp.metrics.conversionRate} conversion rate (${exp.metrics.visitors} visitors)`);
        }
      });

      recommendations.push('For XT activities, focus on whether each targeted audience is converting, not just lift comparisons.');

      if (comparisons.some(exp => exp.metrics.visitors === 0)) {
        recommendations.push('Some experiences have no visitors. Verify audience targeting rules are configured correctly.');
      }
    }
  } else if (activity.type === 'abt') {
    // Automated Personalization specific insights
    insights.push(`🤖 ${typeInfo.comparisonNote}`);

    insights.push(`The algorithm is testing ${comparisons.length} experiences.`);

    if (totalVisitors < 1000) {
      insights.push('⚠️ AP activities require substantial traffic (1000+ visitors) for the algorithm to learn effectively.');
      recommendations.push('Allow more time for the machine learning algorithm to optimize performance.');
    } else {
      insights.push(`✓ Sufficient traffic (${totalVisitors} visitors) for algorithm optimization.`);

      // Show top performers
      const topPerformers = sortedByConversion.slice(0, 3);
      insights.push('Top performing experiences:');
      topPerformers.forEach((exp, idx) => {
        insights.push(`  ${idx + 1}. ${exp.experienceName}: ${exp.metrics.conversionRate} (${exp.metrics.visitors} visitors)`);
      });
    }
  }

  // General insights (apply to all types)

  // Check for low traffic
  if (totalVisitors < 100) {
    insights.push(`⚠️ Low traffic detected: Only ${totalVisitors} total visitors. Results may not be statistically significant.`);
    recommendations.push('Continue running the activity to gather more data before making decisions.');
  }

  // Check for zero conversions
  const hasConversions = comparisons.some(exp => exp.metrics.conversions > 0);
  if (!hasConversions) {
    insights.push('⚠️ No conversions recorded yet for any experience.');
    recommendations.push('Verify that conversion tracking is properly configured.');
    recommendations.push('Check that visitors are reaching the conversion goal (e.g., checkout, form submission).');
  }

  // Activity state recommendations
  if (activity.state === 'saved') {
    insights.push('⚠️ Activity Status: SAVED (not running)');
    recommendations.push('Activate the activity to start collecting meaningful data.');
  } else if (activity.state === 'deactivated') {
    insights.push('⚠️ Activity Status: DEACTIVATED');
    recommendations.push('Activity is deactivated. No new data is being collected.');
  } else if (activity.state === 'approved') {
    insights.push('✓ Activity Status: APPROVED (running)');
  }

  return { insights, recommendations, typeInfo };
}

export async function handler(args, context) {
  const { config } = context;

  try {
    // Step 1: Search for the activity by name
    const activities = await makeTargetRequest(config, 'GET', '/target/activities', null, 'v3');

    if (!activities.activities || activities.activities.length === 0) {
      return {
        success: false,
        error: 'No activities found in your Target account.',
      };
    }

    // Find activity by name (case-insensitive partial match)
    const searchTerm = args.activityName.toLowerCase();
    const matchingActivities = activities.activities.filter(a =>
      a.name.toLowerCase().includes(searchTerm)
    );

    if (matchingActivities.length === 0) {
      return {
        success: false,
        error: `No activity found matching "${args.activityName}".`,
        suggestion: 'Try a different search term or check the activity name.',
      };
    }

    if (matchingActivities.length > 1) {
      return {
        success: false,
        error: `Found ${matchingActivities.length} activities matching "${args.activityName}". Please be more specific.`,
        matchingActivities: matchingActivities.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          state: a.state,
        })),
      };
    }

    const activity = matchingActivities[0];

    // Step 2: Determine activity type and get appropriate report endpoint
    let reportPath;
    switch (activity.type) {
      case 'ab':
        reportPath = `/target/activities/ab/${activity.id}/report/performance`;
        break;
      case 'xt':
        reportPath = `/target/activities/xt/${activity.id}/report/performance`;
        break;
      case 'abt':
        reportPath = `/target/activities/abt/${activity.id}/report/performance`;
        break;
      default:
        return {
          success: false,
          error: `Activity type "${activity.type}" does not support performance reporting.`,
          supportedTypes: ['ab', 'xt', 'abt'],
        };
    }

    // Add reportInterval if provided
    if (args.reportInterval) {
      reportPath += `?reportInterval=${encodeURIComponent(args.reportInterval)}`;
    }

    // Step 3: Get the performance report
    const report = await makeTargetRequest(config, 'GET', reportPath, null, 'v1');

    // Step 3.5: Get QA links if URL is provided (optional, fails gracefully)
    let qaLinks = null;
    if (args.qaUrl) {
      try {
        const qaModePath = `/target/activities/${activity.type}/${activity.id}/qamode`;
        const qaRequestBody = {
          url: args.qaUrl,
          currentActivityOnly: false,
          audienceIdsEvaluatedAsTrue: [],
          audienceIdsEvaluatedAsFalse: [],
        };
        const qaResponse = await makeTargetRequest(config, 'POST', qaModePath, qaRequestBody);
        qaLinks = qaResponse.qaModeExperiences || null;
      } catch (error) {
        // QA links are optional - don't fail the whole request if they can't be retrieved
        console.error('[getActivityInsights] Failed to retrieve QA links:', error.message);
      }
    }

    // Step 4: Format the comparison
    const experienceComparisons = formatExperienceComparison(
      report.activity.experiences,
      report.report.statistics,
      activity.type,
      qaLinks
    );

    // Step 5: Generate insights
    const { insights, recommendations, typeInfo } = generateInsights(experienceComparisons, activity);

    // Step 6: Return comprehensive results
    return {
      success: true,
      activity: {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        typeDisplay: typeInfo.name,
        typeDescription: typeInfo.description,
        state: activity.state,
        priority: activity.priority,
        modifiedAt: activity.modifiedAt,
      },
      reportPeriod: report.reportParameters.reportInterval,
      summary: {
        totalVisitors: report.report.statistics.totals.visitor.totals.entries,
        totalConversions: report.report.statistics.totals.visitor.totals.conversions,
        totalVisits: report.report.statistics.totals.visit.totals.entries,
        totalImpressions: report.report.statistics.totals.impression.totals.entries,
      },
      experienceComparisons,
      insights,
      recommendations,
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
