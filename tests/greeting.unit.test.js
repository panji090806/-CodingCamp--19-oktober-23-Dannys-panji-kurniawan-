/**
 * Unit tests for GreetingWidget
 * Task 3.4 — Requirements: 1.1, 1.2, 2.1, 2.2, 2.3
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

const { getTimeGreeting, StorageUtil } = require('../js/script.js');

describe('getTimeGreeting — unit tests', () => {
  test('returns Selamat Pagi for hour 0', () => {
    expect(getTimeGreeting(0)).toBe('Selamat Pagi');
  });

  test('returns Selamat Pagi for hour 11', () => {
    expect(getTimeGreeting(11)).toBe('Selamat Pagi');
  });

  test('returns Selamat Siang for hour 12', () => {
    expect(getTimeGreeting(12)).toBe('Selamat Siang');
  });

  test('returns Selamat Siang for hour 14', () => {
    expect(getTimeGreeting(14)).toBe('Selamat Siang');
  });

  test('returns Selamat Sore for hour 15', () => {
    expect(getTimeGreeting(15)).toBe('Selamat Sore');
  });

  test('returns Selamat Sore for hour 17', () => {
    expect(getTimeGreeting(17)).toBe('Selamat Sore');
  });

  test('returns Selamat Malam for hour 18', () => {
    expect(getTimeGreeting(18)).toBe('Selamat Malam');
  });

  test('returns Selamat Malam for hour 23', () => {
    expect(getTimeGreeting(23)).toBe('Selamat Malam');
  });
});

describe('StorageUtil — greeting name persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('stores greeting name and retrieves it', () => {
    StorageUtil.set('dashboard_greeting_name', 'Budi');
    expect(StorageUtil.get('dashboard_greeting_name')).toBe('Budi');
  });

  test('returns null when no name stored', () => {
    expect(StorageUtil.get('dashboard_greeting_name')).toBeNull();
  });
});
