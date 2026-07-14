const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  characters: {
    list: () => ipcRenderer.invoke('characters:list'),
    get: (id) => ipcRenderer.invoke('characters:get', id),
    create: (data) => ipcRenderer.invoke('characters:create', data),
    update: (id, data) => ipcRenderer.invoke('characters:update', id, data),
    remove: (id) => ipcRenderer.invoke('characters:remove', id),
  },
});
