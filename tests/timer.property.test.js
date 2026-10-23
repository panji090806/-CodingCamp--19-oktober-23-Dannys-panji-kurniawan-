/**
 * Property-based tests for formatTime
 * Task 5.2 — Property 5: Format waktu Focus Timer selalu MM:SS
 * Validates: Requirements 3.1
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
const { formatTime } = require('../js/script.js');

// Feature: todo-life-dashboard, Property 5: Format waktu Focus Timer selalu MM:SS
describe('formatTime — Property 5', () => {
  test('always produces MM:SS pattern for any value in [0, 1500]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1500 }), (seconds) => {
        const result = formatTime(seconds);
        return /^\d{2}:\d{2}$/.test(result);
      }),
      { numRuns: 100 }
    );
  });

  test('boundary: 0 seconds -> 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  test('boundary: 1500 seconds (25 min) -> 25:00', () => {
    expect(formatTime(1500)).toBe('25:00');
  });

  test('boundary: 90 seconds -> 01:30', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  test('minutes and seconds are zero-padded to two digits', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1500 }), (seconds) => {
        const result = formatTime(seconds);
        const [mins, secs] = result.split(':');
        return mins.length === 2 && secs.length === 2;
      }),
      { numRuns: 100 }
    );
  });
});
