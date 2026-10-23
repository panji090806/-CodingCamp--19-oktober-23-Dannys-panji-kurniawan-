/**
 * Unit tests for FocusTimer
 * Task 5.4 — Requirements: 3.1, 3.2, 3.5, 3.6
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

// Mock timers
jest.useFakeTimers();

document.getElementById = jest.fn(() => null);
document.body.dataset = {};

const { formatTime } = require('../js/script.js');

describe('formatTime — unit tests (Task 5.4)', () => {
  test('0 seconds -> 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  test('1500 seconds (25 min) -> 25:00', () => {
    expect(formatTime(1500)).toBe('25:00');
  });

  test('60 seconds -> 01:00', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  test('90 seconds -> 01:30', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  test('59 seconds -> 00:59', () => {
    expect(formatTime(59)).toBe('00:59');
  });

  test('result always has exactly 5 characters (MM:SS)', () => {
    [0, 30, 60, 90, 599, 600, 1499, 1500].forEach((s) => {
      expect(formatTime(s)).toHaveLength(5);
    });
  });

  test('result always contains exactly one colon', () => {
    [0, 750, 1500].forEach((s) => {
      const result = formatTime(s);
      expect(result.split(':').length).toBe(2);
    });
  });
});
