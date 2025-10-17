/**
 * Comprehensive Page Structure Analysis Script
 * Run this in Chrome DevTools BEFORE generating Adobe Target code
 *
 * Usage:
 * 1. Navigate to target page
 * 2. Execute this script via Chrome DevTools MCP evaluate_script
 * 3. Use the returned structure to write precise selectors
 */

(function() {
  'use strict';

  // Helper: Get full parent chain for an element
  function getParentChain(element) {
    var chain = [];
    var current = element;
    var depth = 0;

    while (current && current !== document.body && depth < 20) {
      var styles = window.getComputedStyle(current);

      chain.push({
        depth: depth,
        tagName: current.tagName,
        id: current.id || null,
        classes: Array.from(current.classList),
        position: styles.position,
        display: styles.display,
        width: styles.width,
        height: styles.height,
        overflow: styles.overflow,
        zIndex: styles.zIndex,
        childCount: current.children.length,
        hasText: current.textContent.trim().length > 0,
        isSemantic: ['HEADER', 'NAV', 'MAIN', 'SECTION', 'ARTICLE', 'ASIDE', 'FOOTER'].indexOf(current.tagName) > -1
      });

      current = current.parentElement;
      depth++;
    }

    return chain;
  }

  // Helper: Find all section-like containers
  function findSectionContainers() {
    var sectionSelectors = [
      'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
      '[class*="section"]', '[class*="container"]',
      '[class*="hero"]', '[class*="banner"]',
      '[role="main"]', '[role="banner"]'
    ];

    var sections = [];
    var seen = new Set();

    sectionSelectors.forEach(function(selector) {
      try {
        var elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
          if (!seen.has(el)) {
            seen.add(el);
            var firstChild = el.firstElementChild;
            sections.push({
              tagName: el.tagName,
              id: el.id || null,
              classes: Array.from(el.classList),
              childCount: el.children.length,
              firstChildTag: firstChild ? firstChild.tagName : null,
              hasH1: el.querySelector('h1') !== null,
              hasH2: el.querySelector('h2') !== null,
              topOffset: el.getBoundingClientRect().top + window.scrollY
            });
          }
        });
      } catch (e) {
        // Invalid selector, skip
      }
    });

    return sections;
  }

  // Helper: Analyze specific target elements
  function analyzeTargets() {
    var targets = {};

    // Find H1 (hero heading)
    var h1 = document.querySelector('h1');
    if (h1) {
      targets.h1 = {
        text: h1.textContent.trim().substring(0, 100),
        parentChain: getParentChain(h1),
        rect: h1.getBoundingClientRect()
      };
    }

    // Find all H2s (section headings for insertion points)
    var h2s = document.querySelectorAll('h2');
    targets.h2s = Array.from(h2s).map(function(h2) {
      return {
        text: h2.textContent.trim().substring(0, 100),
        parentChain: getParentChain(h2).slice(0, 3), // First 3 parents only
        topOffset: h2.getBoundingClientRect().top + window.scrollY
      };
    });

    // Find CTA buttons/links
    var potentialCtas = Array.from(document.querySelectorAll('a, button')).filter(function(el) {
      var text = el.textContent.trim().toLowerCase();
      return text.includes('learn') || text.includes('shop') ||
             text.includes('buy') || text.includes('get') ||
             text.includes('start') || text.includes('try');
    });

    targets.ctas = potentialCtas.slice(0, 5).map(function(cta) {
      return {
        tagName: cta.tagName,
        text: cta.textContent.trim(),
        href: cta.href || null,
        parentChain: getParentChain(cta).slice(0, 3),
        styles: {
          backgroundColor: window.getComputedStyle(cta).backgroundColor,
          color: window.getComputedStyle(cta).color,
          padding: window.getComputedStyle(cta).padding
        }
      };
    });

    return targets;
  }

  // Main analysis
  var analysis = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    sections: findSectionContainers(),
    targets: analyzeTargets(),
    bodyStyles: {
      position: window.getComputedStyle(document.body).position,
      overflow: window.getComputedStyle(document.body).overflow,
      maxWidth: window.getComputedStyle(document.body).maxWidth
    }
  };

  return analysis;
})();
