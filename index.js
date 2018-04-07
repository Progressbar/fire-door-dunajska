const log = require('./logger');

log('starting application');

const {
	openDoor,
	closeDoor,
	toggleDoor,
	openDoorTemp,
} = require('./door-relay');

const { shouldDoorsBeOpen } = require('./clock-events');

const setDoorFromClock = () => {
	if(shouldDoorsBeOpen()) {
		openDoor();
	} else {
		closeDoor();	
	}
}
setInterval(setDoorFromClock, 10 * 1000);
setDoorFromClock();

require('./event-receiver');

log('sync application bootstrap done');
