/**
 * Integration tests for To-Do Life Dashboard
 * Task 10.2 — Full lifecycle end-to-end scenarios
 * Requirements: 4.10, 4.11, 6.8, 6.9
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

const { TodoManager, QuickLinksManager, StorageUtil } = require('../js/script.js');

function resetAll() {
  TodoManager._todos = [];
  QuickLinksManager._links = [];
  localStorageMock.clear();
}

// ─── Todo Full Lifecycle ───────────────────────────────────────────────────

describe('Todo — full lifecycle: add → toggle → edit → delete', () => {
  beforeEach(resetAll);

  test('full todo lifecycle completes without errors', () => {
    // 1. Add
    const addResult = TodoManager.addTodo('Belajar testing');
    expect(addResult.success).toBe(true);
    expect(TodoManager._todos.length).toBe(1);

    const id = TodoManager._todos[0].id;

    // 2. Toggle to completed
    TodoManager.toggleTodo(id);
    expect(TodoManager._todos[0].completed).toBe(true);

    // 3. Toggle back
    TodoManager.toggleTodo(id);
    expect(TodoManager._todos[0].completed).toBe(false);

    // 4. Edit
    const editResult = TodoManager.editTodo(id, 'Belajar integration testing');
    expect(editResult.success).toBe(true);
    expect(TodoManager._todos[0].text).toBe('Belajar integration testing');

    // 5. Delete
    TodoManager.deleteTodo(id);
    expect(TodoManager._todos.length).toBe(0);
  });

  test('todo data persists to storage after each operation', () => {
    TodoManager.addTodo('Persistent todo');
    const id = TodoManager._todos[0].id;

    // After add
    let stored = JSON.parse(localStorageMock.getItem('dashboard_todos'));
    expect(stored.length).toBe(1);

    // After toggle
    TodoManager.toggleTodo(id);
    stored = JSON.parse(localStorageMock.getItem('dashboard_todos'));
    expect(stored[0].completed).toBe(true);

    // After edit
    TodoManager.editTodo(id, 'Updated text');
    stored = JSON.parse(localStorageMock.getItem('dashboard_todos'));
    expect(stored[0].text).toBe('Updated text');

    // After delete
    TodoManager.deleteTodo(id);
    stored = JSON.parse(localStorageMock.getItem('dashboard_todos'));
    expect(stored.length).toBe(0);
  });

  test('reload simulation: todos restored from storage', () => {
    // Simulate saved state
    const savedTodos = [
      { id: '100', text: 'Reload test', completed: true, createdAt: 100 },
      { id: '101', text: 'Another task', completed: false, createdAt: 101 },
    ];
    localStorageMock.setItem('dashboard_todos', JSON.stringify(savedTodos));

    // Simulate fresh load
    TodoManager._todos = [];
    TodoManager.loadFromStorage();

    expect(TodoManager._todos.length).toBe(2);
    expect(TodoManager._todos[0].text).toBe('Reload test');
    expect(TodoManager._todos[0].completed).toBe(true);
    expect(TodoManager._todos[1].text).toBe('Another task');
  });
});

// ─── QuickLinks Full Lifecycle ────────────────────────────────────────────

describe('QuickLinks — full lifecycle: add → delete', () => {
  beforeEach(resetAll);

  test('full link lifecycle: add and delete', () => {
    // Add
    const addResult = QuickLinksManager.addLink('GitHub', 'https://github.com');
    expect(addResult.success).toBe(true);
    expect(QuickLinksManager._links.length).toBe(1);

    const id = QuickLinksManager._links[0].id;

    // Delete
    QuickLinksManager.deleteLink(id);
    expect(QuickLinksManager._links.length).toBe(0);
  });

  test('link data persists to storage after each operation', () => {
    QuickLinksManager.addLink('MDN', 'https://developer.mozilla.org');
    const id = QuickLinksManager._links[0].id;

    // After add
    let stored = JSON.parse(localStorageMock.getItem('dashboard_links'));
    expect(stored.length).toBe(1);
    expect(stored[0].label).toBe('MDN');

    // After delete
    QuickLinksManager.deleteLink(id);
    stored = JSON.parse(localStorageMock.getItem('dashboard_links'));
    expect(stored.length).toBe(0);
  });

  test('reload simulation: links restored from storage', () => {
    const savedLinks = [
      { id: '200', label: 'Google', url: 'https://google.com', createdAt: 200 },
    ];
    localStorageMock.setItem('dashboard_links', JSON.stringify(savedLinks));

    QuickLinksManager._links = [];
    QuickLinksManager.loadFromStorage();

    expect(QuickLinksManager._links.length).toBe(1);
    expect(QuickLinksManager._links[0].label).toBe('Google');
    expect(QuickLinksManager._links[0].url).toBe('https://google.com');
  });
});

// ─── Cross-module: Storage isolation ─────────────────────────────────────

describe('Cross-module storage isolation', () => {
  beforeEach(resetAll);

  test('todo and link storage keys do not interfere with each other', () => {
    TodoManager.addTodo('Task in storage');
    QuickLinksManager.addLink('Link in storage', 'https://example.com');

    const todosStored = JSON.parse(localStorageMock.getItem('dashboard_todos'));
    const linksStored = JSON.parse(localStorageMock.getItem('dashboard_links'));

    expect(todosStored.length).toBe(1);
    expect(linksStored.length).toBe(1);
    expect(todosStored[0].text).toBe('Task in storage');
    expect(linksStored[0].label).toBe('Link in storage');
  });

  test('StorageUtil get/set/remove work correctly for all four dashboard keys', () => {
    const keys = [
      'dashboard_greeting_name',
      'dashboard_todos',
      'dashboard_links',
      'dashboard_theme',
    ];

    keys.forEach((key) => {
      StorageUtil.set(key, 'test_value');
      expect(StorageUtil.get(key)).toBe('test_value');
      StorageUtil.remove(key);
      expect(StorageUtil.get(key)).toBeNull();
    });
  });
});
