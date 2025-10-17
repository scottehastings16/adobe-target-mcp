/**
 * Target Element Identification Script
 * Finds all elements matching user's description and provides context
 *
 * Usage:
 * Call this with a search term (text content) to find all matching elements
 * Returns detailed information about each match for user confirmation
 *
 * Example: findTargetElements('Products')
 * Example: findTargetElements('Learn More')
 */

function identifyTargetElements(searchText, elementTypes) {
  'use strict';

  // Default to common interactive elements if not specified
  elementTypes = elementTypes || ['a', 'button', 'h1', 'h2', 'h3', 'nav', 'div[class*="nav"]'];

  var selector = elementTypes.join(', ');
  var allElements = document.querySelectorAll(selector);
  var matches = [];

  Array.from(allElements).forEach(function(el) {
    var text = el.textContent.trim();

    // Check if this element contains the search text
    if (text.toLowerCase().includes(searchText.toLowerCase())) {
      var rect = el.getBoundingClientRect();
      var scrollY = window.scrollY || window.pageYOffset;

      // Determine location context
      var location = {
        topOffset: Math.round(rect.top + scrollY),
        inViewport: rect.top >= 0 && rect.top <= window.innerHeight,
        inNav: !!el.closest('nav, header, [role="navigation"]'),
        inHero: !!el.closest('[class*="hero"], [class*="banner"], [id*="hero"]'),
        inFooter: !!el.closest('footer, [role="contentinfo"]'),
        inSidebar: !!el.closest('aside, [class*="sidebar"]')
      };

      // Get parent context
      var parent = el.parentElement;
      var parentInfo = {
        tagName: parent ? parent.tagName : 'none',
        className: parent ? parent.className : 'none',
        id: parent ? parent.id || 'none' : 'none'
      };

      // Build location description
      var locationDesc = [];
      if (location.inNav) locationDesc.push('navigation');
      if (location.inHero) locationDesc.push('hero section');
      if (location.inFooter) locationDesc.push('footer');
      if (location.inSidebar) locationDesc.push('sidebar');
      if (locationDesc.length === 0) locationDesc.push('main content area');

      // Get specific selector path
      var selectorPath = buildSelectorPath(el);

      matches.push({
        element: {
          tagName: el.tagName,
          id: el.id || null,
          classes: Array.from(el.classList),
          text: text.length > 100 ? text.substring(0, 100) + '...' : text,
          href: el.href || null
        },
        location: location,
        locationDescription: locationDesc.join(' > '),
        parent: parentInfo,
        selectorPath: selectorPath,
        styles: {
          display: window.getComputedStyle(el).display,
          position: window.getComputedStyle(el).position,
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          color: window.getComputedStyle(el).color
        }
      });
    }
  });

  // Sort by position on page (top to bottom)
  matches.sort(function(a, b) {
    return a.location.topOffset - b.location.topOffset;
  });

  return {
    searchText: searchText,
    totalMatches: matches.length,
    matches: matches
  };
}

// Helper: Build a specific selector path for an element
function buildSelectorPath(element) {
  var path = [];
  var current = element;
  var depth = 0;
  var maxDepth = 4; // Only go up 4 levels

  while (current && current !== document.body && depth < maxDepth) {
    var selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += '#' + current.id;
      path.unshift(selector);
      break; // ID is unique, stop here
    } else if (current.className) {
      var classes = Array.from(current.classList).filter(function(c) {
        return !c.startsWith('at-'); // Exclude our own classes
      });
      if (classes.length > 0) {
        selector += '.' + classes[0]; // Use first class
      }
    }

    path.unshift(selector);
    current = current.parentElement;
    depth++;
  }

  return path.join(' > ');
}

// Auto-execute if search text is provided
// Otherwise, export the function
if (typeof arguments !== 'undefined' && arguments.length > 0) {
  return identifyTargetElements(arguments[0], arguments[1]);
}
