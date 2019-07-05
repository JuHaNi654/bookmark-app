const { app, BrowserWindow, ipcMain } = require('electron')

// Application Window Variables
let win
let bookmarkWindow
let newBookmarkWindow
/**
|--------------------------------------------------
| function called when application started
|--------------------------------------------------
*/
function createWindow() {

    //Initialize sql database when window is created
    const server = require('./javascript/dbService')
    
    // Create Main window with custom size
    win = new BrowserWindow({
        width: 900,
        height: 680,
        webPreferences: {
            nodeIntegration: true
        }
    })

    bookmarkWindow = new BrowserWindow({
        width: 400,
        height: 380,
        parent: win,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    newBookmarkWindow = new BrowserWindow({
        width: 400,
        height: 380,
        parent: win,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // load selected html file on the main window
    win.loadFile('./src/index.html')
    bookmarkWindow.loadFile('./src/bm.html')
    newBookmarkWindow.loadFile('./src/newbookmark.html')
    // Open the DevTools.
    win.webContents.openDevTools()

    //disable webconsole
    //win.webContents.on("devtools-opened", () => { win.webContents.closeDevTools()})

/*
    bookmarkWindow.webContents.on('did-finish-load', () => {
        bookmarkWindow.webContents.send('ping', 'pong')
    })*/

    
    // Clear variable when application window is closed
    win.on('closed', () => {
        win = null
    })

    bookmarkWindow.on('close', (e) => {
        e.preventDefault()
        bookmarkWindow.hide()
    })

    newBookmarkWindow.on('close', (e) => {
        e.preventDefault()
        newBookmarkWindow.hide()
    })


}

// Function called when electron finnished initializing
app.on('ready', createWindow)

// Close all application windows
app.on('window-all-closed', () => {
    win = null
    bookmarkWindow = null
    newBookmarkWindow = null
    // Shutdown process on mac
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Reactivate window if it is closed
app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})


ipcMain.on('open-new-bookmark-window', (event, arg) => {
    console.log(arg)
    newBookmarkWindow.webContents.send('open-window-with-folderid', arg)
    newBookmarkWindow.show()
})


ipcMain.on('receive-and-send-bookmark-id', (event, arg) => {
    bookmarkWindow.webContents.send('send-received-bookmark-id', arg)
    bookmarkWindow.show()
})

