// Заміна base44.entities.Character: зберігає персонажів локально.
// В Electron-застосунку дані йдуть у SQLite (через electron/main.cjs),
// а якщо electronAPI недоступний (наприклад, запуск `npm run dev` у звичайному
// браузері) — використовується localStorage, щоб можна було тестувати UI.

const LS_KEY = 'dnd_characters_v1';

function hasElectronApi() {
  return typeof window !== 'undefined' && !!window.electronAPI?.characters;
}

function lsRead() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function lsWrite(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const Characters = {
  async list() {
    if (hasElectronApi()) return window.electronAPI.characters.list();
    const list = lsRead();
    return [...list].sort((a, b) => (a.updated_date < b.updated_date ? 1 : -1));
  },

  async get(id) {
    if (hasElectronApi()) return window.electronAPI.characters.get(id);
    const list = lsRead();
    const found = list.find((c) => c.id === id);
    if (!found) throw new Error('Персонажа не знайдено');
    return found;
  },

  async create(data) {
    if (hasElectronApi()) return window.electronAPI.characters.create(data);
    const now = new Date().toISOString();
    const character = { id: uuid(), ...data, created_date: now, updated_date: now };
    const list = lsRead();
    list.push(character);
    lsWrite(list);
    return character;
  },

  async update(id, data) {
    if (hasElectronApi()) return window.electronAPI.characters.update(id, data);
    const list = lsRead();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Персонажа не знайдено');
    const updated = { ...list[idx], ...data, updated_date: new Date().toISOString() };
    list[idx] = updated;
    lsWrite(list);
    return updated;
  },

  async remove(id) {
    if (hasElectronApi()) return window.electronAPI.characters.remove(id);
    lsWrite(lsRead().filter((c) => c.id !== id));
    return { success: true };
  },
};
