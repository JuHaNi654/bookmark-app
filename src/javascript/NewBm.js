const ipcRenderer = require('electron').ipcRenderer
const sqlite3 = require('sqlite3').verbose()

let folderId

ipcRenderer.on('open-window-with-folderid', (event, value) => {
    console.log(value)
    folderId = value
})