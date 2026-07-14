const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = 45123;

let charactersFilePath;

function initDatabase() {
  charactersFilePath = path.join(app.getPath('userData'), 'characters.json');
  if (!fs.existsSync(charactersFilePath)) {
    fs.writeFileSync(charactersFilePath, '[]', 'utf-8');
  }
}

function readCharacters() {
  try {
    const raw = fs.readFileSync(charactersFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCharacters(list) {
  fs.writeFileSync(charactersFilePath, JSON.stringify(list, null, 2), 'utf-8');
}

function registerCharacterHandlers() {
  ipcMain.handle('characters:list', () => {
    const list = readCharacters();
    return [...list].sort((a, b) => (a.updated_date < b.updated_date ? 1 : -1));
  });

  ipcMain.handle('characters:get', (_event, id) => {
    const found = readCharacters().find((c) => c.id === id);
    if (!found) throw new Error('Персонажа не знайдено');
    return found;
  });

  ipcMain.handle('characters:create', (_event, data) => {
    const now = new Date().toISOString();
    const character = { id: crypto.randomUUID(), ...data, created_date: now, updated_date: now };
    const list = readCharacters();
    list.push(character);
    writeCharacters(list);
    return character;
  });

  ipcMain.handle('characters:update', (_event, id, data) => {
    const list = readCharacters();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Персонажа не знайдено');
    const updated = { ...list[idx], ...data, updated_date: new Date().toISOString() };
    list[idx] = updated;
    writeCharacters(list);
    return updated;
  });

  ipcMain.handle('characters:remove', (_event, id) => {
    writeCharacters(readCharacters().filter((c) => c.id !== id));
    return { success: true };
  });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(DIST_DIR, decodeURIComponent(req.url.split('?')[0]));
      if (req.url === '/' || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      const ext = path.extname(filePath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function createWindow() {
  await startServer();

  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'D&D Майстерня',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.loadURL(`http://127.0.0.1:${PORT}`);
}

app.whenReady().then(() => {
  initDatabase();
  registerCharacterHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
