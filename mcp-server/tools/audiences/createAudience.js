/**
 * Create Audience Tool
 * Create a new audience
 */
import { makeTargetRequest } from '../../helpers/makeTargetRequest.js';

export const tool = {
  name: 'createAudience',
  description: 'Create a new audience with either target rules or audience rules (cannot mix both). IMPORTANT: Before creating an audience with profile attributes, use listMboxProfileAttributes to verify the correct attribute names exist.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Audience name',
      },
      description: {
        type: 'string',
        description: 'Audience description',
      },
      targetRule: {
        type: 'object',
        description: 'Audience targeting rules (cannot be used with audienceRule). Evaluators: equals, contains, startsWith, endsWith (strings); greater, lesser, greaterEquals, lesserEquals (numeric); matches (geo). Values must be arrays. Examples: {"profile":"age","greater":["25"]} | {"and":[{"profile":"age","greater":["25"]},{"profile":"memberLevel","equals":["gold"]}]}',
      },
      audienceRule: {
        type: 'object',
        description: 'Composite audience rules with restRuleOperator (AND/OR) and rules array (cannot be used with targetRule)',
        properties: {
          restRuleOperator: {
            type: 'string',
            enum: ['AND', 'OR'],
            description: 'Operator for combining rules',
          },
          rules: {
            type: 'array',
            description: 'Array of audience rule objects',
            items: {
              type: 'object',
            },
          },
        },
      },
      origin: {
        type: 'string',
        enum: ['target', 'cloud'],
        description: 'Origin of the audience',
      },
      type: {
        type: 'string',
        enum: ['reusable', 'anonymous', 'property'],
        description: 'Type of audience',
      },
      status: {
        type: 'string',
        enum: ['saved', 'deleted'],
        description: 'Status of the audience',
      },
      workspace: {
        type: 'string',
        description: 'Workspace ID (required for premium customers with multiple workspaces)',
      },
      platform: {
        type: 'object',
        description: 'Platform metadata including sandbox information',
        properties: {
          sandbox: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    required: ['name'],
  },
};

/**
 * Recursively search for profile attributes in targeting rules
 */
function extractProfileAttributes(obj, found = new Set()) {
  if (!obj || typeof obj !== 'object') return found;

  if (obj.profile) {
    found.add(obj.profile);
  }

  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key].forEach(item => extractProfileAttributes(item, found));
    } else if (typeof obj[key] === 'object') {
      extractProfileAttributes(obj[key], found);
    }
  }

  return found;
}

/**
 * Common evaluators used in Adobe Target targetRule
 * Confirmed working evaluators from REST API testing
 */
const COMMON_EVALUATORS = [
  // String evaluators
  'equals', 'contains', 'startsWith', 'endsWith',
  // Numeric comparison evaluators
  'greater', 'lesser', 'greaterEquals', 'lesserEquals',
  // Geo evaluators
  'matches'
];

/**
 * Validate targetRule structure
 */
function validateTargetRule(targetRule) {
  const errors = [];

  function validate(obj, path = 'targetRule') {
    if (!obj || typeof obj !== 'object') return;

    // Check 'and' and 'or' operators have at least 2 values
    if (obj.and && Array.isArray(obj.and)) {
      if (obj.and.length < 2) {
        errors.push(`${path}.and must have at least 2 conditions (found ${obj.and.length}). For a single condition, remove the 'and' wrapper.`);
      }
      obj.and.forEach((item, idx) => validate(item, `${path}.and[${idx}]`));
    }

    if (obj.or && Array.isArray(obj.or)) {
      if (obj.or.length < 2) {
        errors.push(`${path}.or must have at least 2 conditions (found ${obj.or.length}). For a single condition, remove the 'or' wrapper.`);
      }
      obj.or.forEach((item, idx) => validate(item, `${path}.or[${idx}]`));
    }

    // Check 'not' operator has exactly 1 value
    if (obj.not) {
      if (Array.isArray(obj.not)) {
        if (obj.not.length !== 1) {
          errors.push(`${path}.not must have exactly 1 condition (found ${obj.not.length})`);
        }
        obj.not.forEach((item, idx) => validate(item, `${path}.not[${idx}]`));
      } else {
        validate(obj.not, `${path}.not`);
      }
    }

    // Check if this is a condition (has profile, geo, page, mbox, etc.) and verify it has an evaluator
    const dimensionKeys = ['profile', 'geo', 'page', 'mbox', 'custom', 'browser'];
    const hasDimension = dimensionKeys.some(key => obj[key] !== undefined);

    if (hasDimension && !obj.and && !obj.or && !obj.not) {
      // This is a leaf condition, check for evaluator
      const hasEvaluator = COMMON_EVALUATORS.some(evaluator => obj[evaluator] !== undefined);

      if (!hasEvaluator) {
        errors.push(`${path} is missing an evaluator field. Use evaluators like: ${COMMON_EVALUATORS.slice(0, 6).join(', ')}, etc. Example: {"profile":"age","greater":["25"]}`);
      }
    }
  }

  validate(targetRule);
  return errors;
}

export async function handler(args, context) {
  const { config } = context;

  // Validate targetRule structure
  if (args.targetRule) {
    const structureErrors = validateTargetRule(args.targetRule);
    if (structureErrors.length > 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Invalid targetRule structure:\n\n${structureErrors.join('\n')}\n\nIMPORTANT: Use evaluator fields (not "operator"). Values must be arrays.\n\nExamples:\n\nSingle condition:\n{\n  "profile": "age",\n  "greater": ["25"]\n}\n\nMultiple conditions with 'and':\n{\n  "and": [\n    {"profile": "age", "greater": ["25"]},\n    {"profile": "memberLevel", "equals": ["gold"]}\n  ]\n}\n\nEvaluators:\n- String: equals, contains, startsWith, endsWith\n- Numeric: greater (>), lesser (<), greaterEquals (>=), lesserEquals (<=)\n- Geo: matches\n\nCommon patterns:\n- profile: {"profile": "age", "greater": ["25"]}\n- geo: {"geo": "region", "matches": ["california"]}\n- page: {"page": "url", "contains": ["product"]}`
          }
        ]
      };
    }
  }

  // Validate profile attributes if targetRule contains profile references
  if (args.targetRule) {
    const profileAttrs = extractProfileAttributes(args.targetRule);

    if (profileAttrs.size > 0) {
      // Fetch available profile attributes
      const availableAttrs = await makeTargetRequest(config, 'GET', '/target/profileattributes/mbox', null, 'v1');

      if (availableAttrs && availableAttrs.data) {
        const validAttrNames = new Set(availableAttrs.data.map(attr => attr.name));
        const invalidAttrs = [...profileAttrs].filter(attr => !validAttrNames.has(attr));

        if (invalidAttrs.length > 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: The following profile attributes do not exist: ${invalidAttrs.join(', ')}\n\nAvailable profile attributes:\n${[...validAttrNames].join(', ')}\n\nPlease use listMboxProfileAttributes to see all available attributes.`
              }
            ]
          };
        }
      }
    }
  }

  const audienceCreate = { name: args.name };

  // Add optional fields if provided
  if (args.description) audienceCreate.description = args.description;
  if (args.targetRule) audienceCreate.targetRule = args.targetRule;
  if (args.audienceRule) audienceCreate.audienceRule = args.audienceRule;
  if (args.origin) audienceCreate.origin = args.origin;
  if (args.type) audienceCreate.type = args.type;
  if (args.status) audienceCreate.status = args.status;
  if (args.workspace) audienceCreate.workspace = args.workspace;
  if (args.platform) audienceCreate.platform = args.platform;

  return await makeTargetRequest(config, 'POST', '/target/audiences', audienceCreate, 'v3');
}
