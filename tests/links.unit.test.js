/**
 * Unit tests for QuickLinksManager
 * Task 8.5 — Requirements: 6.1–6.9
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

const { QuickLinksManager, validateUrl } = require('../js/script.js');

function resetLinks() {
  QuickLinksManager._links = [];
  localStorageMock.clear();
}

describe('QuickLinksManager — addLink', () => {
  beforeEach(resetLinks);

  test('adding valid link increases list length by 1', () => {
    const result = QuickLinksManager.addLink('GitHub', 'https://github.com');
    expect(result.success).toBe(true);
    expect(QuickLinksManager._links.length).toBe(1);
  });

  test('added link has correct label (trimmed) and url', () => {
    QuickLinksManager.addLink('  GitHub  ', 'https://github.com');
    expect(QuickLinksManager._links[0].label).toBe('GitHub');
    expect(QuickLinksManager._links[0].url).toBe('https://github.com');
  });

  test('empty label is rejected', () => {
    const result = QuickLinksManager.addLink('', 'https://github.com');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(QuickLinksManager._links.length).toBe(0);
  });

  test('whitespace-only label is rejected', () => {
    const result = QuickLinksManager.addLink('   ', 'https://github.com');
    expect(result.success).toBe(false);
    expect(QuickLinksManager._links.length).toBe(0);
  });

  test('invalid URL (no http/https) is rejected', () => {
    const result = QuickLinksManager.addLink('Bad URL', 'github.com');
    expect(result.success).toBe(false);
    expect(QuickLinksManager._links.length).toBe(0);
  });

  test('URL without protocol is rejected', () => {
    const result = QuickLinksManager.addLink('Bad', 'www.example.com');
    expect(result.success).toBe(false);
  });

  test('http:// URL is accepted', () => {
    const result = QuickLinksManager.addLink('HTTP Site', 'http://example.com');
    expect(result.success).toBe(true);
  });

  test('21st link is rejected with max limit error', () => {
    // Fill up to 20
    for (let i = 0; i < 20; i++) {
      QuickLinksManager.addLink(`Link ${i}`, `https://example${i}.com`);
    }
    expect(QuickLinksManager._links.length).toBe(20);

    const result = QuickLinksManager.addLink('Extra', 'https://extra.com');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(QuickLinksManager._links.length).toBe(20);
  });
});

describe('QuickLinksManager — deleteLink', () => {
  beforeEach(resetLinks);

  test('deleting a link removes it from the list', () => {
    QuickLinksManager.addLink('GitHub', 'https://github.com');
    const id = QuickLinksManager._links[0].id;
    QuickLinksManager.deleteLink(id);
    expect(QuickLinksManager._links.length).toBe(0);
  });

  test('deleting one link leaves others intact', () => {
    QuickLinksManager.addLink('GitHub', 'https://github.com');
    QuickLinksManager.addLink('Google', 'https://google.com');
    QuickLinksManager.addLink('MDN', 'https://developer.mozilla.org');
    const idToDelete = QuickLinksManager._links[1].id;
    QuickLinksManager.deleteLink(idToDelete);
    expect(QuickLinksManager._links.length).toBe(2);
    expect(QuickLinksManager._links.map((l) => l.label)).not.toContain('Google');
  });
});

describe('QuickLinksManager — storage persistence', () => {
  beforeEach(resetLinks);

  test('after addLink, storage contains the link', () => {
    QuickLinksManager.addLink('Test', 'https://test.com');
    const stored = JSON.parse(localStorageMock.getItem('dashboard_links'));
    expect(stored).not.toBeNull();
    expect(stored.length).toBe(1);
    expect(stored[0].label).toBe('Test');
  });

  test('loadFromStorage restores links from mock storage', () => {
    const fakeLinks = [
      { id: '1', label: 'Saved', url: 'https://saved.com', createdAt: 1 },
    ];
    localStorageMock.setItem('dashboard_links', JSON.stringify(fakeLinks));
    QuickLinksManager.loadFromStorage();
    expect(QuickLinksManager._links.length).toBe(1);
    expect(QuickLinksManager._links[0].label).toBe('Saved');
  });
});

describe('validateUrl', () => {
  test('https:// URL returns true', () => {
    expect(validateUrl('https://github.com')).toBe(true);
  });

  test('http:// URL returns true', () => {
    expect(validateUrl('http://example.com')).toBe(true);
  });

  test('empty string returns false', () => {
    expect(validateUrl('')).toBe(false);
  });

  test('relative URL returns false', () => {
    expect(validateUrl('/path/to/page')).toBe(false);
  });

  test('ftp:// URL returns false', () => {
    expect(validateUrl('ftp://files.example.com')).toBe(false);
  });
});
