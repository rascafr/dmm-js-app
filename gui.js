const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

// --- get device info ---

const bpInfo = document.getElementById('bpInfo');
const spanInfo = document.getElementById('device-info');
bpInfo.onclick = () => {
    spanInfo.innerHTML = '---';
    ipcRenderer.send('getInfo');
}

ipcRenderer.on('info', (event, arg) => {
    spanInfo.innerHTML = arg.id + ' - ' + arg.version;
})

// --- read voltage ---

const spanVoltage = document.getElementById('device-voltage');

const bpDCV = document.getElementById('bpDCV');
bpDCV.onclick = () => {
    spanVoltage.innerHTML = '---';
    ipcRenderer.send('test');
}

const bpACV = document.getElementById('bpACV');
bpACV.onclick = () => {
    spanVoltage.innerHTML = '---';
    ipcRenderer.send('test');
}

ipcRenderer.on('voltage', (event, arg) => {
    spanVoltage.innerHTML = arg;
})
