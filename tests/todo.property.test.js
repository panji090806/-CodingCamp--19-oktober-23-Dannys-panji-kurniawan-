/**
 * Property-based tests for TodoManager duplicate prevention
 * Task 6.2 — Property 1: Normalisasi tugas mencegah duplikat (Requirements 5.1, 5.2)
 * Task 6.3 — Property 2: Penolakan edit duplikat (Requirements 5.3, 5.4)
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

// Helper: reset TodoManager state between tests
function resetTodoManager() {
  TodoManager._todos = [];
  localStorageMock.clear();
}

// Feature: todo-life-dashboard, Property 1: Normalisasi tugas mencegah duplikat
describe('TodoManager — Property 1: Duplicate prevention on addTodo', () => {
  beforeEach(resetTodoManager);

  test('adding the same text twice (after normalization) rejects the second', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (text) => {
          resetTodoManager();
          const first = TodoManager.addTodo(text);
          if (!first.success) return true; // skip if first add fails for other reasons
          const lengthAfterFirst = TodoManager._todos.length;
          const second = TodoManager.addTodo(text);
          return second.success === false && TodoManager._todos.length === lengthAfterFirst;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('whitespace-padded duplicates are also rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (text) => {
          resetTodoManager();
          const base = text.trim();
          TodoManager.addTodo(base);
          const withSpaces = TodoManager.addTodo(`  ${base}  `);
          return withSpaces.success === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('case-insensitive duplicates are rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0 && /[a-z]/i.test(s)),
        (text) => {
          resetTodoManager();
          const lower = text.trim().toLowerCase();
          TodoManager.addTodo(lower);
          const upper = TodoManager.addTodo(lower.toUpperCase());
          return upper.success === false;
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: todo-life-dashboard, Property 2: Penolakan edit duplikat
describe('TodoManager — Property 2: Duplicate rejection on editTodo', () => {
  beforeEach(resetTodoManager);

  test('editing a todo to match another existing todo is rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (text1, text2) => {
          const norm1 = text1.trim().toLowerCase();
          const norm2 = text2.trim().toLowerCase();
          if (norm1 === norm2) return true; // skip identical inputs

          resetTodoManager();
          TodoManager.addTodo(text1.trim());
          TodoManager.addTodo(text2.trim());
          if (TodoManager._todos.length < 2) return true; // skip if add failed

          const secondId = TodoManager._todos[1].id;
          const originalText = TodoManager._todos[1].text;

          // Try to edit second todo to have same text as first
          const result = TodoManager.editTodo(secondId, text1.trim());
          return (
            result.success === false &&
            TodoManager._todos[1].text === originalText
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('editing a todo to its own text succeeds (not a duplicate of itself)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (text) => {
          resetTodoManager();
          TodoManager.addTodo(text.trim());
          if (TodoManager._todos.length === 0) return true;

          const id = TodoManager._todos[0].id;
          const result = TodoManager.editTodo(id, text.trim());
          return result.success === true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
