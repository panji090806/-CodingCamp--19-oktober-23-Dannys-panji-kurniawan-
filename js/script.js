/**
 * To-Do Life Dashboard
 * Single-file application using the IIFE Module Pattern.
 * All modules are scoped inside the outer IIFE to avoid polluting the global scope.
 * Pure functions are exported onto module.exports for Jest/Vitest testing.
 */

(function () {
  'use strict';

  /* ===========================================================
     StorageUtil
     Requirements: 2.6, 7.6
     =========================================================== */
  const StorageUtil = {
    isAvailable() {
      try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
      } catch (_e) {
        return false;
      }
    },
    get(key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return null;
        return JSON.parse(raw);
      } catch (_e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (_e) {}
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (_e) {}
    },
  };

  /* ===========================================================
     ThemeSwitcher
     Requirements: 7.1–7.6
     =========================================================== */
  const ThemeSwitcher = {
    _current: 'light',

    init() {
      const stored = StorageUtil.get('dashboard_theme');
      const theme = stored === 'dark' ? 'dark' : 'light';
      this._current = theme;
      this.applyTheme(theme);

      const btn = document.getElementById('theme-toggle');
      if (btn) {
        btn.addEventListener('click', () => this.toggle());
      }
    },

    toggle() {
      const next = this._current === 'light' ? 'dark' : 'light';
      this._current = next;
      StorageUtil.set('dashboard_theme', next);
      this.applyTheme(next);
    },

    applyTheme(theme) {
      document.body.dataset.theme = theme;
      const btn = document.getElementById('theme-toggle');
      if (btn) {
        if (theme === 'dark') {
          btn.textContent = '☀️';
          btn.setAttribute('aria-label', 'Beralih ke mode terang');
        } else {
          btn.textContent = '🌙';
          btn.setAttribute('aria-label', 'Beralih ke mode gelap');
        }
      }
    },
  };

  /* ===========================================================
     GreetingWidget
     Requirements: 1.1–1.6, 2.1–2.6
     =========================================================== */
  const GreetingWidget = {
    _name: '',
    _intervalId: null,

    /**
     * Pure function: maps hour (0–23) to greeting string.
     * Property 6: always returns one of four valid strings.
     * @param {number} hour
     * @returns {string}
     */
    getTimeGreeting(hour) {
      if (hour >= 0 && hour <= 11) return 'Selamat Pagi';
      if (hour >= 12 && hour <= 14) return 'Selamat Siang';
      if (hour >= 15 && hour <= 17) return 'Selamat Sore';
      return 'Selamat Malam';
    },

    init() {
      const stored = StorageUtil.get('dashboard_greeting_name');
      this._name = (typeof stored === 'string') ? stored : '';

      const input = document.getElementById('greeting-name-input');
      if (input && this._name) {
        input.value = this._name;
      }

      this.updateClock();
      this._intervalId = setInterval(() => this.updateClock(), 1000);

      const saveBtn = document.getElementById('greeting-name-save');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const val = input ? input.value : '';
          this.saveName(val);
        });
      }

      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.saveName(input.value);
          }
        });
        input.addEventListener('input', () => {
          const err = document.getElementById('greeting-name-error');
          if (err) err.textContent = '';
        });
      }
    },

    updateClock() {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];

      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');

      const timeEl = document.getElementById('greeting-time');
      if (timeEl) timeEl.textContent = `${hh}:${mm}:${ss}`;

      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();

      const dateEl = document.getElementById('greeting-date');
      if (dateEl) dateEl.textContent = `${dayName}, ${date} ${monthName} ${year}`;

      const greeting = this.getTimeGreeting(now.getHours());
      const greetingText = this._name
        ? `${greeting}, ${this._name}!`
        : `${greeting}!`;

      const greetEl = document.getElementById('greeting-text');
      if (greetEl) greetEl.textContent = greetingText;
    },

    saveName(name) {
      const trimmed = name.trim();
      const errEl = document.getElementById('greeting-name-error');

      if (trimmed.length > 50) {
        if (errEl) errEl.textContent = 'Nama terlalu panjang (maks 50 karakter).';
        return;
      }

      this._name = trimmed;

      if (trimmed === '') {
        StorageUtil.remove('dashboard_greeting_name');
      } else {
        StorageUtil.set('dashboard_greeting_name', trimmed);
      }

      if (errEl) errEl.textContent = '';
      this.updateClock();
    },
  };

  /* ===========================================================
     FocusTimer
     Requirements: 3.1–3.7
     =========================================================== */
  const FocusTimer = {
    _timeLeft: 1500,
    _isRunning: false,
    _intervalId: null,

    /**
     * Pure function: converts seconds to "MM:SS" string.
     * Property 5: always matches /^\d{2}:\d{2}$/
     * @param {number} seconds
     * @returns {string}
     */
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    init() {
      const display = document.getElementById('timer-display');
      if (display) display.textContent = this.formatTime(this._timeLeft);

      const startBtn = document.getElementById('timer-start');
      const stopBtn = document.getElementById('timer-stop');
      const resetBtn = document.getElementById('timer-reset');

      if (startBtn) startBtn.addEventListener('click', () => this.start());
      if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
      if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
    },

    start() {
      if (this._isRunning) return;
      this._isRunning = true;

      const startBtn = document.getElementById('timer-start');
      const stopBtn = document.getElementById('timer-stop');
      if (startBtn) startBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = false;

      this._intervalId = setInterval(() => this.tick(), 1000);
    },

    stop() {
      if (this._intervalId) {
        clearInterval(this._intervalId);
        this._intervalId = null;
      }
      this._isRunning = false;

      const startBtn = document.getElementById('timer-start');
      const stopBtn = document.getElementById('timer-stop');
      if (startBtn) startBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
    },

    reset() {
      this.stop();
      this._timeLeft = 1500;
      const display = document.getElementById('timer-display');
      if (display) display.textContent = this.formatTime(this._timeLeft);

      const notif = document.getElementById('timer-notification');
      if (notif) notif.classList.add('hidden');
    },

    tick() {
      this._timeLeft -= 1;
      const display = document.getElementById('timer-display');
      if (display) display.textContent = this.formatTime(this._timeLeft);

      if (this._timeLeft <= 0) {
        this.stop();
        const notif = document.getElementById('timer-notification');
        if (notif) {
          notif.classList.remove('hidden');
          setTimeout(() => notif.classList.add('hidden'), 3000);
        }
      }
    },
  };

  /* ===========================================================
     TodoManager
     Requirements: 4.1–4.11, 5.1–5.4
     =========================================================== */
  const TodoManager = {
    _todos: [],

    /**
     * Pure function: normalize text for duplicate detection.
     * @param {string} text
     * @returns {string}
     */
    normalize(text) {
      return text.trim().toLowerCase();
    },

    /**
     * Pure function: check for duplicate todo text.
     * @param {string} text
     * @param {string|undefined} excludeId
     * @returns {boolean}
     */
    isDuplicate(text, excludeId) {
      const normalized = this.normalize(text);
      return this._todos.some(
        (t) => t.id !== excludeId && this.normalize(t.text) === normalized
      );
    },

    loadFromStorage() {
      const stored = StorageUtil.get('dashboard_todos');
      this._todos = Array.isArray(stored) ? stored : [];
    },

    saveToStorage() {
      StorageUtil.set('dashboard_todos', this._todos);
    },

    addTodo(text) {
      if (!text || text.trim() === '') {
        return { success: false, error: 'Tugas tidak boleh kosong.' };
      }
      if (text.trim().length > 200) {
        return { success: false, error: 'Tugas terlalu panjang (maks 200 karakter).' };
      }
      if (this.isDuplicate(text)) {
        return { success: false, error: 'Tugas ini sudah ada dalam daftar.' };
      }

      const now = Date.now();
      this._todos.push({
        id: now.toString(),
        text: text.trim(),
        completed: false,
        createdAt: now,
      });
      this.saveToStorage();
      this.renderList();
      return { success: true };
    },

    editTodo(id, newText) {
      if (!newText || newText.trim() === '') {
        return { success: false, error: 'Tugas tidak boleh kosong.' };
      }
      if (this.isDuplicate(newText, id)) {
        return { success: false, error: 'Tugas ini sudah ada dalam daftar.' };
      }

      const todo = this._todos.find((t) => t.id === id);
      if (!todo) return { success: false, error: 'Tugas tidak ditemukan.' };

      todo.text = newText.trim();
      this.saveToStorage();
      this.renderList();
      return { success: true };
    },

    toggleTodo(id) {
      const todo = this._todos.find((t) => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        this.saveToStorage();
        this.renderList();
      }
    },

    deleteTodo(id) {
      this._todos = this._todos.filter((t) => t.id !== id);
      this.saveToStorage();
      this.renderList();
    },

    renderList() {
      const list = document.getElementById('todo-list');
      if (!list) return;
      list.innerHTML = '';

      this._todos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = todo.id;

        // Toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn btn-icon';
        toggleBtn.textContent = todo.completed ? '✓' : '○';
        toggleBtn.setAttribute(
          'aria-label',
          todo.completed ? 'Batalkan selesai' : 'Tandai selesai'
        );
        toggleBtn.addEventListener('click', () => this.toggleTodo(todo.id));

        // Text span
        const span = document.createElement('span');
        span.className = 'todo-text' + (todo.completed ? ' completed' : '');
        span.textContent = todo.text;

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-icon';
        editBtn.textContent = '✏️';
        editBtn.setAttribute('aria-label', 'Edit tugas');
        editBtn.addEventListener('click', () => this._enterEditMode(li, todo));

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-icon';
        delBtn.textContent = '🗑️';
        delBtn.setAttribute('aria-label', 'Hapus tugas');
        delBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        li.appendChild(toggleBtn);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    },

    _enterEditMode(li, todo) {
      li.innerHTML = '';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'todo-edit-input';
      input.value = todo.text;
      input.maxLength = 200;
      input.setAttribute('aria-label', 'Edit teks tugas');

      const errSpan = document.createElement('span');
      errSpan.className = 'error-msg';
      errSpan.setAttribute('aria-live', 'polite');

      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn btn-primary';
      saveBtn.textContent = 'Simpan';
      saveBtn.setAttribute('aria-label', 'Simpan perubahan tugas');
      saveBtn.addEventListener('click', () => {
        const result = this.editTodo(todo.id, input.value);
        if (!result.success) {
          errSpan.textContent = result.error || '';
        }
      });

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn';
      cancelBtn.textContent = 'Batal';
      cancelBtn.setAttribute('aria-label', 'Batalkan edit tugas');
      cancelBtn.addEventListener('click', () => this.renderList());

      input.addEventListener('input', () => { errSpan.textContent = ''; });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveBtn.click();
        if (e.key === 'Escape') cancelBtn.click();
      });

      li.appendChild(input);
      li.appendChild(saveBtn);
      li.appendChild(cancelBtn);
      li.appendChild(errSpan);
      input.focus();
    },

    init() {
      this.loadFromStorage();
      this.renderList();

      const addBtn = document.getElementById('todo-add');
      const todoInput = document.getElementById('todo-input');
      const errEl = document.getElementById('todo-error');

      const doAdd = () => {
        if (!todoInput) return;
        const result = this.addTodo(todoInput.value);
        if (result.success) {
          todoInput.value = '';
          if (errEl) errEl.textContent = '';
        } else {
          if (errEl) errEl.textContent = result.error || '';
        }
      };

      if (addBtn) addBtn.addEventListener('click', doAdd);

      if (todoInput) {
        todoInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') doAdd();
        });
        todoInput.addEventListener('input', () => {
          if (errEl) errEl.textContent = '';
        });
      }
    },
  };

  /* ===========================================================
     QuickLinksManager
     Requirements: 6.1–6.9
     =========================================================== */
  const QuickLinksManager = {
    _links: [],

    /**
     * Pure function: validate URL starts with http:// or https://
     * Property 7: true iff url starts with http:// or https://
     * @param {string} url
     * @returns {boolean}
     */
    validateUrl(url) {
      if (typeof url !== 'string') return false;
      return url.startsWith('http://') || url.startsWith('https://');
    },

    loadFromStorage() {
      const stored = StorageUtil.get('dashboard_links');
      this._links = Array.isArray(stored) ? stored : [];
    },

    saveToStorage() {
      StorageUtil.set('dashboard_links', this._links);
    },

    addLink(label, url) {
      if (!label || label.trim() === '') {
        return { success: false, error: 'Label tidak boleh kosong.' };
      }
      if (!this.validateUrl(url)) {
        return { success: false, error: 'URL harus dimulai dengan http:// atau https://.' };
      }
      if (this._links.length >= 20) {
        return { success: false, error: 'Batas maksimum 20 tautan telah tercapai.' };
      }

      const now = Date.now();
      this._links.push({
        id: now.toString(),
        label: label.trim(),
        url: url,
        createdAt: now,
      });
      this.saveToStorage();
      this.renderList();
      return { success: true };
    },

    deleteLink(id) {
      this._links = this._links.filter((l) => l.id !== id);
      this.saveToStorage();
      this.renderList();
    },

    renderList() {
      const list = document.getElementById('links-list');
      if (!list) return;
      list.innerHTML = '';

      this._links.forEach((link) => {
        const li = document.createElement('li');
        li.className = 'link-item';

        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = link.label;
        a.setAttribute('aria-label', `Buka ${link.label} di tab baru`);

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-icon';
        delBtn.textContent = '🗑️';
        delBtn.setAttribute('aria-label', `Hapus tautan ${link.label}`);
        delBtn.addEventListener('click', () => this.deleteLink(link.id));

        li.appendChild(a);
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    },

    init() {
      this.loadFromStorage();
      this.renderList();

      const addBtn = document.getElementById('link-add');
      const labelInput = document.getElementById('link-label-input');
      const urlInput = document.getElementById('link-url-input');
      const errEl = document.getElementById('link-error');

      const doAdd = () => {
        const label = labelInput ? labelInput.value : '';
        const url = urlInput ? urlInput.value : '';
        const result = this.addLink(label, url);
        if (result.success) {
          if (labelInput) labelInput.value = '';
          if (urlInput) urlInput.value = '';
          if (errEl) errEl.textContent = '';
        } else {
          if (errEl) errEl.textContent = result.error || '';
        }
      };

      if (addBtn) addBtn.addEventListener('click', doAdd);

      if (labelInput) {
        labelInput.addEventListener('input', () => {
          if (errEl) errEl.textContent = '';
        });
      }
      if (urlInput) {
        urlInput.addEventListener('input', () => {
          if (errEl) errEl.textContent = '';
        });
        urlInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') doAdd();
        });
      }
    },
  };

  /* ===========================================================
     AppInit
     Entry point — init order matters: ThemeSwitcher first (FOUC prevention)
     =========================================================== */
  const AppInit = {
    init() {
      ThemeSwitcher.init();
      GreetingWidget.init();
      FocusTimer.init();
      TodoManager.init();
      QuickLinksManager.init();
    },
  };

  /* ===========================================================
     Bootstrap
     =========================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    AppInit.init();
  });

  /* ===========================================================
     CommonJS export shim for Jest/Vitest testing
     =========================================================== */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      StorageUtil,
      getTimeGreeting: (hour) => GreetingWidget.getTimeGreeting(hour),
      formatTime: (seconds) => FocusTimer.formatTime(seconds),
      normalize: (text) => TodoManager.normalize(text),
      isDuplicate: (text, excludeId) => TodoManager.isDuplicate(text, excludeId),
      validateUrl: (url) => QuickLinksManager.validateUrl(url),
      TodoManager,
      QuickLinksManager,
    };
  }
})();
