const {
    app,
    BrowserWindow
} = require('electron')
const ipc = require('electron').ipcMain;
const fs = require('fs');
const Control = require('./control');

// data logging
const logFile = process.argv[2];
if (logFile) console.log('Will log data into', logFile);
const logValues = [];
const startDate = new Date();

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

    // save logged data
    if (logFile) {
        const logString = "time;value\n" + logValues.map(lv => `${lv.time};${lv.value}`.replace('.', ',')).join('\n');
        fs.writeFileSync(logFile, logString)
        console.log('Saved', logValues.length, 'log lines,', logString.length, 'bytes');
    }

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

        // log if needed
        if (logFile) logValues.push({time: new Date() - startDate, value: measure});
    });
});

Control.connect().then(() => { // connect to DMM
    mainWindow.webContents.send('info', Control.getInfo());
});
