/**
 * Unit tests for Extension DOM element class extraction utilities.
 */

function getClassName(element) {
  if (!element) return '';
  try {
    if (typeof element.className === 'string') return element.className;
    if (element.className && typeof element.className.baseVal === 'string') return element.className.baseVal;
    if (typeof element.getAttribute === 'function') return element.getAttribute('class') || '';
  } catch (e) {
    return '';
  }
  return '';
}

// Simple test runner for static verification
function runDomUtilsTests() {
  const results = [];

  // Test 1: null / undefined element
  const res1 = getClassName(null);
  console.assert(res1 === '', 'Failed null element check');
  results.push({ test: 'getClassName(null)', pass: res1 === '' });

  // Test 2: Standard HTML element with string className
  const htmlEl = { className: 'chat-container prompt-input' };
  const res2 = getClassName(htmlEl);
  console.assert(res2 === 'chat-container prompt-input', 'Failed HTML string className');
  results.push({ test: 'getClassName(HTML element)', pass: res2 === 'chat-container prompt-input' });

  // Test 3: SVG Element with SVGAnimatedString className object ({ baseVal, animVal })
  const svgEl = { className: { baseVal: 'svg-icon active', animVal: 'svg-icon active' } };
  const res3 = getClassName(svgEl);
  console.assert(res3 === 'svg-icon active', 'Failed SVGAnimatedString className');
  results.push({ test: 'getClassName(SVG element)', pass: res3 === 'svg-icon active' });

  // Test 4: Element without className property but with getAttribute('class')
  const fallbackEl = {
    className: undefined,
    getAttribute: (attr) => (attr === 'class' ? 'fallback-class' : null)
  };
  const res4 = getClassName(fallbackEl);
  console.assert(res4 === 'fallback-class', 'Failed getAttribute fallback');
  results.push({ test: 'getClassName(element without className prop)', pass: res4 === 'fallback-class' });

  // Test 5: Splitting class string into filtered array
  const classes = res2.split(/\s+/).filter(Boolean);
  console.assert(classes.length === 2 && classes[0] === 'chat-container', 'Failed class splitting');
  results.push({ test: 'className.split(/\s+/).filter(Boolean)', pass: classes.length === 2 });

  console.log('[Extension Test Results]', JSON.stringify(results, null, 2));
  return results.every(r => r.pass);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getClassName, runDomUtilsTests };
}

runDomUtilsTests();
