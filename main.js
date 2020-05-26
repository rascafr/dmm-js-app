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
        height: 335,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile('index.html');
    mainWindow.setResizable(false);
}
app.whenReady().then(createWindow);

// closing / macos management
app.on('window-all-closed', () => {
    Control.disconnect().then(() => process.exit());
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // macos: recreate window
    if (mainWindow === null) {
        createWindow();
    }
});

ipc.on('getInfo', (event, arg) => {
    event.reply('info', Control.getInfo());
});

ipc.on('measure', function (event, arg) {
    Control.read(arg).then(measure => {
        event.reply('measureValue', measure);
    });
});

Control.connect().then(() => { // connect to DMM
    mainWindow.webContents.send('info', Control.getInfo());
});
