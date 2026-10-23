/**
 * Unit tests for StorageUtil and ThemeSwitcher
 * Task 2.3 — Requirements: 7.3, 7.4, 7.5
 */

// Mock localStorage before requiring the module
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

// Mock document for ThemeSwitcher
document.body.dataset = {};
document.getElementById = jest.fn(() => null);

const { StorageUtil } = require('../js/script.js');

describe('StorageUtil', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('set and get round-trip with JSON serialization', () => {
    StorageUtil.set('test_key', { value: 42, name: 'test' });
    const result = StorageUtil.get('test_key');
    expect(result).toEqual({ value: 42, name: 'test' });
  });

  test('get returns null for non-existent key', () => {
    expect(StorageUtil.get('nonexistent')).toBeNull();
  });

  test('set stores arrays correctly', () => {
    const arr = [1, 2, 3];
    StorageUtil.set('arr_key', arr);
    expect(StorageUtil.get('arr_key')).toEqual([1, 2, 3]);
  });

  test('remove deletes the key', () => {
    StorageUtil.set('to_remove', 'hello');
    StorageUtil.remove('to_remove');
    expect(StorageUtil.get('to_remove')).toBeNull();
  });

  test('isAvailable returns boolean', () => {
    expect(typeof StorageUtil.isAvailable()).toBe('boolean');
  });

  test('get returns null for malformed JSON gracefully', () => {
    // Simulate corrupted storage
    localStorageMock.setItem('bad_json', '{not valid json}');
    expect(StorageUtil.get('bad_json')).toBeNull();
  });

  test('set with string value stores and retrieves correctly', () => {
    StorageUtil.set('dashboard_theme', 'dark');
    expect(StorageUtil.get('dashboard_theme')).toBe('dark');
  });
});
