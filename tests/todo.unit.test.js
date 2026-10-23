/**
 * Unit tests for TodoManager
 * Task 6.7 — Requirements: 4.1–4.11, 5.1–5.4
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

const { TodoManager, normalize } = require('../js/script.js');

function resetTodoManager() {
  TodoManager._todos = [];
  localStorageMock.clear();
}

describe('TodoManager — addTodo', () => {
  beforeEach(resetTodoManager);

  test('adding valid todo increases list length by 1', () => {
    const result = TodoManager.addTodo('Belajar JavaScript');
    expect(result.success).toBe(true);
    expect(TodoManager._todos.length).toBe(1);
  });

  test('added todo has correct text (trimmed)', () => {
    TodoManager.addTodo('  Belajar JavaScript  ');
    expect(TodoManager._todos[0].text).toBe('Belajar JavaScript');
  });

  test('empty input is rejected', () => {
    const result = TodoManager.addTodo('');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(TodoManager._todos.length).toBe(0);
  });

  test('whitespace-only input is rejected', () => {
    const result = TodoManager.addTodo('   ');
    expect(result.success).toBe(false);
    expect(TodoManager._todos.length).toBe(0);
  });

  test('duplicate todo is rejected', () => {
    TodoManager.addTodo('Beli susu');
    const result = TodoManager.addTodo('Beli susu');
    expect(result.success).toBe(false);
    expect(TodoManager._todos.length).toBe(1);
  });

  test('case-insensitive duplicate is rejected', () => {
    TodoManager.addTodo('beli susu');
    const result = TodoManager.addTodo('BELI SUSU');
    expect(result.success).toBe(false);
    expect(TodoManager._todos.length).toBe(1);
  });

  test('newly added todo has completed=false', () => {
    TodoManager.addTodo('Tugas baru');
    expect(TodoManager._todos[0].completed).toBe(false);
  });
});

describe('TodoManager — editTodo', () => {
  beforeEach(resetTodoManager);

  test('editing with valid text updates the todo', () => {
    TodoManager.addTodo('Tugas lama');
    const id = TodoManager._todos[0].id;
    const result = TodoManager.editTodo(id, 'Tugas baru');
    expect(result.success).toBe(true);
    expect(TodoManager._todos[0].text).toBe('Tugas baru');
  });

  test('editing with empty text is rejected', () => {
    TodoManager.addTodo('Tugas');
    const id = TodoManager._todos[0].id;
    const result = TodoManager.editTodo(id, '');
    expect(result.success).toBe(false);
    expect(TodoManager._todos[0].text).toBe('Tugas');
  });

  test('editing with whitespace-only text is rejected, original preserved', () => {
    TodoManager.addTodo('Tugas');
    const id = TodoManager._todos[0].id;
    const result = TodoManager.editTodo(id, '   ');
    expect(result.success).toBe(false);
    expect(TodoManager._todos[0].text).toBe('Tugas');
  });

  test('editing to match another todo is rejected', () => {
    TodoManager.addTodo('Tugas A');
    TodoManager.addTodo('Tugas B');
    const idB = TodoManager._todos[1].id;
    const result = TodoManager.editTodo(idB, 'Tugas A');
    expect(result.success).toBe(false);
    expect(TodoManager._todos[1].text).toBe('Tugas B');
  });
});

describe('TodoManager — toggleTodo', () => {
  beforeEach(resetTodoManager);

  test('toggle changes completed from false to true', () => {
    TodoManager.addTodo('Toggle test');
    const id = TodoManager._todos[0].id;
    TodoManager.toggleTodo(id);
    expect(TodoManager._todos[0].completed).toBe(true);
  });

  test('double toggle returns to original state (round-trip)', () => {
    TodoManager.addTodo('Toggle roundtrip');
    const id = TodoManager._todos[0].id;
    const original = TodoManager._todos[0].completed;
    TodoManager.toggleTodo(id);
    TodoManager.toggleTodo(id);
    expect(TodoManager._todos[0].completed).toBe(original);
  });
});

describe('TodoManager — deleteTodo', () => {
  beforeEach(resetTodoManager);

  test('deleting a todo removes it from the list', () => {
    TodoManager.addTodo('Untuk dihapus');
    const id = TodoManager._todos[0].id;
    TodoManager.deleteTodo(id);
    expect(TodoManager._todos.length).toBe(0);
  });

  test('deleting one of multiple todos leaves the others intact', () => {
    TodoManager.addTodo('Tugas 1');
    TodoManager.addTodo('Tugas 2');
    TodoManager.addTodo('Tugas 3');
    const id = TodoManager._todos[1].id;
    TodoManager.deleteTodo(id);
    expect(TodoManager._todos.length).toBe(2);
    expect(TodoManager._todos.map((t) => t.text)).not.toContain('Tugas 2');
  });
});

describe('TodoManager — storage persistence', () => {
  beforeEach(resetTodoManager);

  test('after addTodo, storage contains the new todo', () => {
    TodoManager.addTodo('Tugas tersimpan');
    const stored = JSON.parse(localStorageMock.getItem('dashboard_todos'));
    expect(stored).not.toBeNull();
    expect(stored.length).toBe(1);
    expect(stored[0].text).toBe('Tugas tersimpan');
  });

  test('loadFromStorage restores todos from mock storage', () => {
    const fakeTodos = [
      { id: '1', text: 'Loaded todo', completed: false, createdAt: 1 },
    ];
    localStorageMock.setItem('dashboard_todos', JSON.stringify(fakeTodos));
    TodoManager.loadFromStorage();
    expect(TodoManager._todos.length).toBe(1);
    expect(TodoManager._todos[0].text).toBe('Loaded todo');
  });
});

describe('normalize', () => {
  test('trims whitespace and lowercases', () => {
    expect(normalize('  Hello World  ')).toBe('hello world');
  });

  test('already normalized string unchanged', () => {
    expect(normalize('test')).toBe('test');
  });
});
