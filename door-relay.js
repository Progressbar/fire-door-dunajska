const { Gpio } = require('onoff');
const log = require('./logger');

const doorRelay = new Gpio(18, 'out');

const updateDoorRelay = () => {
	doorRelay.writeSync(+isDoorOpen);
}

let isDoorOpen = false;
const toggleOpenDoor = () => {
	isDoorOpen = !isDoorOpen;
	updateDoorRelay();
	log('toggling');
}

const openDoor = () => {
	isDoorOpen = true;
	updateDoorRelay();
	log('opening');
}
const closeDoor = () => {
	isDoorOpen = false;
	updateDoorRelay();
	log('closing');
}
const openDoorTemporarily = (ms=10*1000) => {
	log('opening from temporary');
	openDoor();
	setTimeout(() => {
		log('closing from temporary');
		closeDoor();
	}, ms);
}

module.exports = {
	toggleOpenDoor,
	openDoor,
	closeDoor,
	openDoorTemporarily,
	isDoorOpen() {
		return isDoorOpen;	
	},
}
