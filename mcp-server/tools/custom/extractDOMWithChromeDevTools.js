/**
 * Extract DOM with Chrome DevTools Tool
 *
 * This tool provides guidance for using Chrome DevTools MCP to extract live DOM content.
 * Since this MCP server cannot directly call another MCP server, this tool provides
 * instructions and JavaScript snippets for Claude to execute via Chrome DevTools MCP.
 */

export const tool = {
  name: 'extractDOMWithChromeDevTools',
  description: `Get instructions and JavaScript snippets for extracting live DOM/CSS using Chrome DevTools MCP.

This tool provides ready-to-use JavaScript code that Claude should execute using the Chrome DevTools MCP 'evaluate_script' tool.

WORKFLOW:
1. Claude calls this tool to get extraction snippets
2. Claude uses Chrome DevTools MCP 'navigate_to' to load the page
3. Claude uses Chrome DevTools MCP 'evaluate_script' with the provided snippets
4. Extracted data is used for Target activity creation

This approach is BETTER than fetchAndAnalyzePage because:
- Gets LIVE rendered DOM (not static HTML)
- Includes JavaScript-generated content
- Accesses computed styles (actual applied CSS)
- More accurate element discovery
- No memory overhead from JSDOM parsing`,
  inputSchema: {
    type: 'object',
    properties: {
      extractionType: {
        type: 'string',
        enum: ['full-page', 'elements', 'computed-styles', 'forms', 'buttons', 'images', 'custom'],
        description: 'Type of data to extract from the page',
      },
      customSelector: {
        type: 'string',
        description: 'CSS selector for custom extraction (when extractionType is "custom")',
      },
    },
    required: ['extractionType'],
  },
};

export async function handler(args) {
  const snippets = {
    'full-page': {
      description: 'Extract complete page HTML and metadata',
      script: `
(() => {
  return {
    html: document.documentElement.outerHTML,
    title: document.title,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    bodyHTML: document.body.innerHTML,
    headHTML: document.head.innerHTML
  };
})()`,
      usage: 'Use Chrome DevTools MCP: evaluate_script with the script above',
    },

    'elements': {
      description: 'Extract interactive elements (buttons, links, CTAs)',
      script: `
(() => {
  const getSelector = (el) => {
    if (el.id) return '#' + el.id;
    if (el.className) {
      const classes = Array.from(el.classList).join('.');
      return el.tagName.toLowerCase() + '.' + classes;
    }
    return el.tagName.toLowerCase();
  };

  const buttons = Array.from(document.querySelectorAll('button, a.btn, input[type="button"], input[type="submit"], a[class*="button"]'));
  const links = Array.from(document.querySelectorAll('a')).filter(a => !buttons.includes(a));

  return {
    buttons: buttons.map(el => ({
      tag: el.tagName,
      text: el.textContent.trim().substring(0, 100),
      selector: getSelector(el),
      id: el.id,
      classes: Array.from(el.classList),
      href: el.href || null,
      visible: el.offsetParent !== null,
      rect: el.getBoundingClientRect()
    })),
    links: links.slice(0, 20).map(el => ({
      text: el.textContent.trim().substring(0, 50),
      href: el.href,
      selector: getSelector(el),
      visible: el.offsetParent !== null
    })),
    headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(el => ({
      tag: el.tagName,
      text: el.textContent.trim(),
      selector: getSelector(el),
      id: el.id
    }))
  };
})()`,
      usage: 'Use Chrome DevTools MCP: evaluate_script with the script above',
    },

    'computed-styles': {
      description: 'Get computed styles for specific element',
      script: `
((selector) => {
  const el = document.querySelector(selector);
  if (!el) return { error: 'Element not found: ' + selector };

  const computed = window.getComputedStyle(el);
  const styles = {};

  // Extract key CSS properties
  const props = [
    'display', 'position', 'width', 'height',
    'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight',
    'padding', 'margin', 'border', 'borderRadius',
    'textAlign', 'lineHeight', 'letterSpacing',
    'boxShadow', 'transform', 'transition'
  ];

  props.forEach(prop => {
    styles[prop] = computed[prop];
  });

  return {
    selector: selector,
    computedStyles: styles,
    inlineStyle: el.getAttribute('style'),
    rect: el.getBoundingClientRect()
  };
})(YOUR_SELECTOR_HERE)`,
      usage: 'Replace YOUR_SELECTOR_HERE with actual CSS selector, then use Chrome DevTools MCP: evaluate_script',
    },

    'forms': {
      description: 'Extract form structure',
      script: `
(() => {
  const forms = Array.from(document.querySelectorAll('form'));

  return forms.map(form => ({
    id: form.id,
    action: form.action,
    method: form.method,
    inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
      type: input.type,
      name: input.name,
      id: input.id,
      placeholder: input.placeholder,
      required: input.required,
      value: input.value
    }))
  }));
})()`,
      usage: 'Use Chrome DevTools MCP: evaluate_script with the script above',
    },

    'buttons': {
      description: 'Extract all button-like elements with detailed info',
      script: `
(() => {
  const getUniqueSelector = (el) => {
    if (el.id) return '#' + el.id;

    let selector = el.tagName.toLowerCase();
    if (el.className) {
      selector += '.' + Array.from(el.classList).join('.');
    }

    // Add nth-child if needed for uniqueness
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child =>
        child.tagName === el.tagName &&
        child.className === el.className
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(el) + 1;
        selector += ':nth-of-type(' + index + ')';
      }
    }

    return selector;
  };

  const buttonSelectors = [
    'button',
    'a.btn', 'a[class*="button"]',
    'input[type="button"]',
    'input[type="submit"]',
    '[role="button"]'
  ];

  const buttons = Array.from(document.querySelectorAll(buttonSelectors.join(', ')));

  return buttons.map((el, index) => {
    const computed = window.getComputedStyle(el);
    return {
      index,
      tag: el.tagName.toLowerCase(),
      text: el.textContent.trim().substring(0, 100),
      selector: getUniqueSelector(el),
      id: el.id || null,
      classes: Array.from(el.classList),
      href: el.href || null,
      visible: el.offsetParent !== null && computed.visibility !== 'hidden',
      rect: el.getBoundingClientRect(),
      styles: {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontSize: computed.fontSize,
        padding: computed.padding,
        borderRadius: computed.borderRadius
      }
    };
  }).filter(btn => btn.visible);
})()`,
      usage: 'Use Chrome DevTools MCP: evaluate_script with the script above',
    },

    'images': {
      description: 'Extract image elements with metadata',
      script: `
(() => {
  return Array.from(document.querySelectorAll('img')).map(img => ({
    src: img.src,
    alt: img.alt,
    width: img.naturalWidth,
    height: img.naturalHeight,
    displayWidth: img.width,
    displayHeight: img.height,
    id: img.id,
    classes: Array.from(img.classList),
    visible: img.offsetParent !== null
  })).filter(img => img.visible);
})()`,
      usage: 'Use Chrome DevTools MCP: evaluate_script with the script above',
    },

    'custom': {
      description: 'Extract custom selector with full details',
      script: args.customSelector ? `
((selector) => {
  const elements = Array.from(document.querySelectorAll(selector));

  if (elements.length === 0) {
    return { error: 'No elements found for selector: ' + selector };
  }

  return elements.map((el, index) => {
    const computed = window.getComputedStyle(el);
    return {
      index,
      tag: el.tagName.toLowerCase(),
      text: el.textContent.trim().substring(0, 200),
      html: el.outerHTML.substring(0, 500),
      id: el.id,
      classes: Array.from(el.classList),
      attributes: Array.from(el.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {}),
      visible: el.offsetParent !== null,
      rect: el.getBoundingClientRect(),
      computedStyles: {
        display: computed.display,
        position: computed.position,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        padding: computed.padding,
        margin: computed.margin
      }
    };
  });
})('${args.customSelector}')` : 'ERROR: customSelector parameter required for custom extraction',
      usage: 'Use Chrome DevTools MCP: evaluate_script with the script above',
    },
  };

  const selected = snippets[args.extractionType];

  if (!selected) {
    throw new Error(`Invalid extraction type: ${args.extractionType}`);
  }

  return {
    extractionType: args.extractionType,
    description: selected.description,
    instructions: [
      '1. Use Chrome DevTools MCP to navigate to the target page:',
      '   Tool: navigate_to',
      '   Args: { url: "https://example.com" }',
      '',
      '2. Execute the extraction script below using Chrome DevTools MCP:',
      '   Tool: evaluate_script',
      '   Args: { script: <script below> }',
      '',
      '3. The result will contain the extracted page data',
      '',
      '4. Use the extracted data to create Adobe Target modifications',
    ],
    script: selected.script.trim(),
    usage: selected.usage,
    notes: [
      'This approach provides LIVE, RENDERED page data',
      'Much more accurate than static HTML parsing',
      'Includes JavaScript-generated content',
      'Accesses computed styles (actual applied CSS)',
      'No memory overhead from parsing libraries',
    ],
  };
}
