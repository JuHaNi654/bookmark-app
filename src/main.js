const { app, BrowserWindow } = require('electron')

// Application Window Variables
let win
let bookmarkWindow

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



    // load selected html file on the main window
    win.loadFile('./src/index.html')

    // Open the DevTools.
    win.webContents.openDevTools()

    //disable webconsole
    //win.webContents.on("devtools-opened", () => { win.webContents.closeDevTools()})
    
    // Clear variable when application window is closed
    win.on('closed', () => {
        win = null
    })



}

// Function called when electron finnished initializing
app.on('ready', createWindow)

// Close all application windows
app.on('window-all-closed', () => {
    win = null
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


