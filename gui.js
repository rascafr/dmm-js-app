const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

let selControl = null;
let loopEnabled = false;

// --- get device info ---

const bpInfo = document.getElementById('bpInfo');
const spanInfo = document.getElementById('device-info');
bpInfo.onclick = () => {
    spanInfo.innerHTML = '---';
    ipcRenderer.send('getInfo');
}

ipcRenderer.on('info', (event, arg) => {
    spanInfo.innerHTML = arg.id + ' - ' + arg.version;
});

// --- simple and dummy loop control ---

document.getElementById('bpLoop').onclick = () => {
    if (!selControl) return;
    ipcRenderer.send('measure', selControl.id);
    loopEnabled = true;
}

document.getElementById('bpSingle').onclick = () => {
    loopEnabled = false;
}

// --- read voltage ---

const spanVoltage = document.getElementById('device-voltage');

const controls = [
    {id: 'dcv', element: 'bpDCV', unit: 'VDC', signed: true},
    {id: 'dca', element: 'bpDCA', unit: 'ADC', signed: true},
    {id: 'acv', element: 'bpACV', unit: 'VAC', signed: true},
    {id: 'aca', element: 'bpACA', unit: 'AAC', signed: true},
    {id: '2wr', element: 'bp2W', unit: 'OHM'},
    {id: '4wr', element: 'bp4W', unit: 'OHM'},
    {id: 'freq', element: 'bpFreq', unit: 'Hz'},
    {id: 'period', element: 'bpPeriod', unit: 'S'},
    {id: 'cont', element: 'bpCont', unit: 'OHM'}
];
controls.forEach(c => {
    document.getElementById(c.element).onclick = () => {
        spanVoltage.innerHTML = '---';
        ipcRenderer.send('measure', c.id);
        selControl = c;
    }
})

ipcRenderer.on('measureValue', (event, arg) => {
    if (!selControl.signed && arg <= 0) arg = Math.abs(arg);
    if (arg === 9.9e+37) arg = selControl.id === 'cont' ? 'OPEN' : 'OVLD&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'; // ugly fix for OPEN & Overload label
    else arg = parseUnitNumber(arg)
    
    spanVoltage.innerHTML = arg + '' + (arg !== 'OPEN' ? selControl.unit : '');

    if (loopEnabled) {
        ipcRenderer.send('measure', selControl.id);
    }
})

function parseUnitNumber(num) {
    pad = (n) => {
        let nn = Math.round(n * 1000000 + Number.EPSILON) / 1000000;
        return nn === 0 || nn === -0 ? `${nn}.`.padEnd(8, '0') : `${nn}`.padEnd(8, '0');
    }
    let an = Math.abs(num);
    if (an < 1) return pad(num * 1000) + ' m';
    else if (an >= 1000 && num < 1000000) return pad(num / 1000) + ' K';
    else if (an >= 1000000) return pad(num / 1000000) + ' M';
    else return pad(an) + ' ';
}