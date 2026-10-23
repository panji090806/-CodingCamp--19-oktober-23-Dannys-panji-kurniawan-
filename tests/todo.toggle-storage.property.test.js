/**
 * Property-based tests for TodoManager toggle round-trip and storage persistence
 * Task 6.5 — Property 3: Toggle completed adalah idempoten ganda (Requirements 4.4, 4.5)
 * Task 6.6 — Property 4: Tugas yang ditambahkan tersimpan di Local Storage (Requirements 4.2, 4.10)
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
const { TodoManager } = require('../js/script.js');

function resetTodoManager() {
  TodoManager._todos = [];
  localStorageMock.clear();
}

// Feature: todo-life-dashboard, Property 3: Toggle completed adalah idempoten ganda (round-trip)
describe('TodoManager — Property 3: Toggle round-trip', () => {
  beforeEach(resetTodoManager);

  test('double toggle always returns to original completed state', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (initialCompleted, text) => {
          resetTodoManager();
          TodoManager.addTodo(text.trim());
          if (TodoManager._todos.length === 0) return true;

          const id = TodoManager._todos[0].id;
          // Set initial state
          if (TodoManager._todos[0].completed !== initialCompleted) {
            TodoManager.toggleTodo(id);
          }
          const before = TodoManager._todos[0].completed;

          // Double toggle
          TodoManager.toggleTodo(id);
          TodoManager.toggleTodo(id);

          return TodoManager._todos[0].completed === before;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('single toggle always inverts the completed state', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (text) => {
          resetTodoManager();
          TodoManager.addTodo(text.trim());
          if (TodoManager._todos.length === 0) return true;

          const id = TodoManager._todos[0].id;
          const before = TodoManager._todos[0].completed;
          TodoManager.toggleTodo(id);
          return TodoManager._todos[0].completed === !before;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: todo-life-dashboard, Property 4: Tugas yang ditambahkan tersimpan di Local Storage
describe('TodoManager — Property 4: Storage persistence after addTodo', () => {
  beforeEach(resetTodoManager);

  test('after addTodo with valid text, storage contains the todo', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        (text) => {
          resetTodoManager();
          const result = TodoManager.addTodo(text.trim());
          if (!result.success) return true;

          const stored = localStorageMock.getItem('dashboard_todos');
          if (!stored) return false;
          const parsed = JSON.parse(stored);
          return (
            Array.isArray(parsed) &&
            parsed.some((t) => t.text === text.trim())
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('stored todos array length never exceeds actual todos length', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
          { minLength: 1, maxLength: 5 }
        ),
        (texts) => {
          resetTodoManager();
          texts.forEach((t) => TodoManager.addTodo(t.trim()));

          const stored = localStorageMock.getItem('dashboard_todos');
          if (!stored) return TodoManager._todos.length === 0;
          const parsed = JSON.parse(stored);
          return parsed.length === TodoManager._todos.length;
        }
      ),
      { numRuns: 50 }
    );
  });
});
