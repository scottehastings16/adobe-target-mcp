/**
 * Preview QA Validation Script
 * Run this AFTER injecting preview script to validate modifications
 *
 * Checks for:
 * - Elements positioned outside viewport
 * - Accidentally modified existing elements
 * - Overlapping elements (z-index conflicts)
 * - Expected new elements are present
 * - CSS conflicts or broken styles
 */

(function() {
  'use strict';

  var issues = [];
  var warnings = [];

  // 1. CHECK: Are all expected AT elements present?
  function checkExpectedElements() {
    var expectedClasses = [
      'at-countdown-timer',
      'at-limited-time-badge',
      'at-limited-badge',
      'at-summer-promo-banner',
      'at-promo-banner',
      'at-banner-cta-button',
      'at-cta-button',
      'adobe-target-preview-indicator'
    ];

    var found = [];
    var missing = [];

    expectedClasses.forEach(function(className) {
      var el = document.querySelector('.' + className);
      if (el) {
        found.push(className);
      } else {
        missing.push(className);
      }
    });

    return { found: found, missing: missing };
  }

  // 2. CHECK: Are elements positioned outside visible viewport?
  function checkViewportPositioning() {
    var atElements = document.querySelectorAll('[class*="at-"]');
    var offscreen = [];

    atElements.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var styles = window.getComputedStyle(el);

      // Skip if display:none or hidden
      if (styles.display === 'none' || styles.visibility === 'hidden') {
        return;
      }

      // Check if completely off-screen
      if (rect.right < 0 || rect.left > window.innerWidth ||
          rect.bottom < 0 || rect.top > window.innerHeight) {
        offscreen.push({
          className: el.className,
          position: {
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom
          }
        });
      }

      // Check if element is too wide (stretching page)
      if (rect.width > window.innerWidth * 1.2) {
        warnings.push({
          type: 'too_wide',
          className: el.className,
          width: Math.round(rect.width),
          viewportWidth: window.innerWidth
        });
      }
    });

    if (offscreen.length > 0) {
      issues.push({
        type: 'offscreen_elements',
        count: offscreen.length,
        elements: offscreen
      });
    }
  }

  // 3. CHECK: Were any non-AT elements accidentally modified?
  function checkAccidentalModifications() {
    var accidents = [];

    // Check if original page buttons were modified
    var allButtons = document.querySelectorAll('button, a[class*="button"], a[class*="btn"]');
    allButtons.forEach(function(btn) {
      // Skip AT-created elements
      if (btn.className && btn.className.includes('at-')) {
        return;
      }

      var styles = window.getComputedStyle(btn);
      var bgColor = styles.backgroundColor;

      // Check if button has AT's orange color but isn't an AT element
      if (bgColor === 'rgb(255, 87, 51)' || bgColor === 'rgb(255, 165, 0)') {
        // Check if this is intentional (has at- class)
        if (!btn.className.includes('at-')) {
          accidents.push({
            type: 'accidental_styling',
            element: btn.tagName,
            text: btn.textContent.trim().substring(0, 50),
            classes: Array.from(btn.classList),
            backgroundColor: bgColor
          });
        }
      }
    });

    if (accidents.length > 0) {
      issues.push({
        type: 'accidental_modifications',
        count: accidents.length,
        elements: accidents
      });
    }
  }

  // 4. CHECK: Z-index conflicts (overlapping elements)
  function checkZIndexConflicts() {
    var atElements = Array.from(document.querySelectorAll('[class*="at-"]'));
    var conflicts = [];

    for (var i = 0; i < atElements.length; i++) {
      for (var j = i + 1; j < atElements.length; j++) {
        var el1 = atElements[i];
        var el2 = atElements[j];
        var rect1 = el1.getBoundingClientRect();
        var rect2 = el2.getBoundingClientRect();

        // Check if rectangles overlap
        var overlap = !(rect1.right < rect2.left ||
                       rect1.left > rect2.right ||
                       rect1.bottom < rect2.top ||
                       rect1.top > rect2.bottom);

        if (overlap) {
          var z1 = parseInt(window.getComputedStyle(el1).zIndex) || 0;
          var z2 = parseInt(window.getComputedStyle(el2).zIndex) || 0;

          conflicts.push({
            element1: { className: el1.className, zIndex: z1 },
            element2: { className: el2.className, zIndex: z2 },
            overlapArea: {
              width: Math.round(Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left)),
              height: Math.round(Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top))
            }
          });
        }
      }
    }

    if (conflicts.length > 0) {
      warnings.push({
        type: 'z_index_overlaps',
        count: conflicts.length,
        conflicts: conflicts
      });
    }
  }

  // 5. CHECK: CSS errors (invalid styles, broken animations)
  function checkCSSErrors() {
    var atElements = document.querySelectorAll('[class*="at-"]');
    var cssErrors = [];

    atElements.forEach(function(el) {
      var styles = window.getComputedStyle(el);

      // Check for broken positioning
      if (styles.position === 'absolute') {
        var parent = el.parentElement;
        var parentStyles = window.getComputedStyle(parent);

        if (parentStyles.position === 'static') {
          warnings.push({
            type: 'positioning_warning',
            element: el.className,
            issue: 'Absolute positioned element with static parent - may not position correctly'
          });
        }
      }

      // Check for invisible elements (might be a mistake)
      if (styles.opacity === '0' || styles.display === 'none') {
        warnings.push({
          type: 'invisible_element',
          element: el.className,
          reason: styles.opacity === '0' ? 'opacity: 0' : 'display: none'
        });
      }
    });
  }

  // 6. CHECK: Page layout integrity
  function checkPageLayout() {
    var bodyWidth = document.body.scrollWidth;
    var viewportWidth = window.innerWidth;

    // Check if page got wider (horizontal scroll introduced)
    if (bodyWidth > viewportWidth * 1.05) {
      issues.push({
        type: 'horizontal_scroll',
        bodyWidth: bodyWidth,
        viewportWidth: viewportWidth,
        message: 'Preview modifications may have introduced horizontal scrolling'
      });
    }

    // Check if original page elements are still visible
    var h1 = document.querySelector('h1');
    if (h1) {
      var h1Styles = window.getComputedStyle(h1);
      if (h1Styles.display === 'none' || h1Styles.visibility === 'hidden') {
        issues.push({
          type: 'original_content_hidden',
          element: 'h1',
          message: 'Original H1 heading is now hidden'
        });
      }
    }
  }

  // Run all checks
  var expectedElements = checkExpectedElements();
  checkViewportPositioning();
  checkAccidentalModifications();
  checkZIndexConflicts();
  checkCSSErrors();
  checkPageLayout();

  // Return results
  return {
    status: issues.length === 0 ? 'PASS' : 'ISSUES_FOUND',
    timestamp: new Date().toISOString(),
    expectedElements: expectedElements,
    issues: issues,
    warnings: warnings,
    summary: {
      criticalIssues: issues.length,
      warnings: warnings.length,
      elementsFound: expectedElements.found.length,
      elementsMissing: expectedElements.missing.length
    }
  };
})();
