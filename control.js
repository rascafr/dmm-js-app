const Control = module.exports;

const DMMjs = require('dmm.js-serial');
const device = new DMMjs('/dev/tty.usbserial-14530');
device.open();

Control.connect = () => {
    device.linkDevice()
}

Control.getInfo = () => device.getDeviceInfo();

Control.read = () => device.readDCVoltage();

Control.disconnect = () => {
    device.unlinkDevice()
}