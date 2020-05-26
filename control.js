const Control = module.exports;

const fs = require('fs');
const DMMjs = require('dmm.js-serial');
let device = null;

Control.connect = () => {
    const serialDeviceToPick = fs.readdirSync('/dev/').filter(d => d.startsWith('tty.usbserial'))[0];
    if (!serialDeviceToPick) {
        console.error('Cannot find any /dev/tty serial device.');
        process.exit(-1);
    } else console.log('Picked up serial device', serialDeviceToPick);

    device = new DMMjs(`/dev/${serialDeviceToPick}`);
    return device.open().then(() => device.linkDevice())
}

Control.getInfo = () => {
    if (!device) return new Promise((resolve) => resolve('Not connected'));
    return device.getDeviceInfo()
};

Control.read = (type) => {
    if (!device) return new Promise((resolve) => resolve(0));
    switch (type) {
        case 'dcv': return device.readDCVoltage();
        case 'dca': return device.readDCCurrent();
        case 'acv': return device.readACVoltage();
        case 'aca': return device.readACCurrent();
        case '2wr': return device.readResistance();
        case '4wr': return customRead('CONF:FRESistance AUTO');
        case 'freq': return device.readFrequency();
        case 'period': return customRead('CONF:PERiod AUTO');
        case 'cont': return customRead('CONF:CONTinuity');
    }
}

async function customRead(command) {
    await device.writeCommand(command);
    const v = await device.readCommand('READ?');
    return parseFloat(v);
}

Control.disconnect = () => {
    if (device) {
        return device.unlinkDevice()
        device = null;
    }
}