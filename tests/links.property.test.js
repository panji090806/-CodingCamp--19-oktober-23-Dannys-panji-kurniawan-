/**
 * Property-based tests for validateUrl
 * Task 8.2 — Property 7: Validasi URL QuickLinks
 * Validates: Requirements 6.4
 */

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

document.getElementById = jest.fn(() => null);
document.body.dataset = {};

const fc = require('fast-check');
const { validateUrl } = require('../js/script.js');

// Feature: todo-life-dashboard, Property 7: Validasi URL QuickLinks
describe('validateUrl — Property 7', () => {
  test('returns true for any string starting with http://', () => {
    fc.assert(
      fc.property(fc.string(), (suffix) => {
        return validateUrl('http://' + suffix) === true;
      }),
      { numRuns: 100 }
    );
  });

  test('returns true for any string starting with https://', () => {
    fc.assert(
      fc.property(fc.string(), (suffix) => {
        return validateUrl('https://' + suffix) === true;
      }),
      { numRuns: 100 }
    );
  });

  test('returns false for empty string', () => {
    expect(validateUrl('')).toBe(false);
  });

  test('returns false for relative URLs', () => {
    fc.assert(
      fc.property(
        fc.string().filter(
          (s) => !s.startsWith('http://') && !s.startsWith('https://')
        ),
        (url) => {
          return validateUrl(url) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('returns false for ftp:// and other protocols', () => {
    expect(validateUrl('ftp://example.com')).toBe(false);
    expect(validateUrl('ws://example.com')).toBe(false);
    expect(validateUrl('file:///path')).toBe(false);
  });

  test('boundary: exactly http:// returns true', () => {
    expect(validateUrl('http://')).toBe(true);
  });

  test('boundary: exactly https:// returns true', () => {
    expect(validateUrl('https://')).toBe(true);
  });
});
