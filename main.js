const {
    app,
    BrowserWindow
} = require('electron')
const ipc = require('electron').ipcMain;
const Control = require('./control');

let mainWindow = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadFile('index.html')
}
app.whenReady().then(createWindow)

// closing / macos management
app.on('window-all-closed', () => {
    Control.disconnect()
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // macos: recreate window
    if (win === null) {
        createWindow()
    }
})

ipc.on('getInfo', (event, arg) => {
    event.reply('info', Control.getInfo());
})

ipc.on('test', function (event, arg) {
    Control.read().then(voltage => {
        event.reply('voltage', Math.round(voltage * 100000 + Number.EPSILON) / 100000 + ' V')
    });
})

Control.connect() // connect to DMM
