/**
 * Property-based tests for getTimeGreeting
 * Task 3.2 — Property 6: Fungsi sapaan mencakup seluruh jam dalam sehari
 * Validates: Requirements 1.3, 1.4, 1.5, 1.6
 */

// Mock localStorage and document before requiring module
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
const { getTimeGreeting } = require('../js/script.js');

// Feature: todo-life-dashboard, Property 6: Fungsi sapaan mencakup seluruh jam dalam sehari
describe('getTimeGreeting — Property 6', () => {
  const validGreetings = ['Selamat Pagi', 'Selamat Siang', 'Selamat Sore', 'Selamat Malam'];

  test('always returns one of four valid greetings for any hour 0–23', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
        const result = getTimeGreeting(hour);
        return validGreetings.includes(result);
      }),
      { numRuns: 100 }
    );
  });

  test('hour 0–11 returns Selamat Pagi', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 11 }), (hour) => {
        return getTimeGreeting(hour) === 'Selamat Pagi';
      }),
      { numRuns: 50 }
    );
  });

  test('hour 12–14 returns Selamat Siang', () => {
    fc.assert(
      fc.property(fc.integer({ min: 12, max: 14 }), (hour) => {
        return getTimeGreeting(hour) === 'Selamat Siang';
      }),
      { numRuns: 50 }
    );
  });

  test('hour 15–17 returns Selamat Sore', () => {
    fc.assert(
      fc.property(fc.integer({ min: 15, max: 17 }), (hour) => {
        return getTimeGreeting(hour) === 'Selamat Sore';
      }),
      { numRuns: 50 }
    );
  });

  test('hour 18–23 returns Selamat Malam', () => {
    fc.assert(
      fc.property(fc.integer({ min: 18, max: 23 }), (hour) => {
        return getTimeGreeting(hour) === 'Selamat Malam';
      }),
      { numRuns: 50 }
    );
  });

  test('never returns empty string or undefined', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
        const result = getTimeGreeting(hour);
        return typeof result === 'string' && result.length > 0;
      }),
      { numRuns: 100 }
    );
  });
});
