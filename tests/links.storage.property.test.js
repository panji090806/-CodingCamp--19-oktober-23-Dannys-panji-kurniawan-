/**
 * Property-based tests for QuickLinksManager storage persistence
 * Task 8.4 — Property 8: Tautan yang ditambahkan tersimpan di Local Storage
 * Validates: Requirements 6.2, 6.5, 6.8
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
const { QuickLinksManager } = require('../js/script.js');

function resetLinks() {
  QuickLinksManager._links = [];
  localStorageMock.clear();
}

// Feature: todo-life-dashboard, Property 8: Tautan yang ditambahkan tersimpan di Local Storage
describe('QuickLinksManager — Property 8: Storage persistence and max 20 cap', () => {
  beforeEach(resetLinks);

  test('after addLink with valid inputs, storage contains the link', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.string().map((s) => 'https://' + s),
        (label, url) => {
          resetLinks();
          const result = QuickLinksManager.addLink(label.trim(), url);
          if (!result.success) return true;

          const stored = localStorageMock.getItem('dashboard_links');
          if (!stored) return false;
          const parsed = JSON.parse(stored);
          return (
            Array.isArray(parsed) &&
            parsed.some((l) => l.label === label.trim() && l.url === url)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('total stored links never exceeds 20', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
            fc.string().map((s) => 'https://' + s)
          ),
          { minLength: 1, maxLength: 25 }
        ),
        (pairs) => {
          resetLinks();
          pairs.forEach(([label, url]) => {
            QuickLinksManager.addLink(label.trim(), url);
          });

          const stored = localStorageMock.getItem('dashboard_links');
          if (!stored) return QuickLinksManager._links.length === 0;
          const parsed = JSON.parse(stored);
          return parsed.length <= 20 && QuickLinksManager._links.length <= 20;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('21st link is rejected with max error', () => {
    // Fill up to 20
    for (let i = 0; i < 20; i++) {
      QuickLinksManager.addLink(`Link ${i}`, `https://example${i}.com`);
    }
    const result = QuickLinksManager.addLink('Extra', 'https://extra.com');
    expect(result.success).toBe(false);
    expect(QuickLinksManager._links.length).toBe(20);
  });
});
