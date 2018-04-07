const EventSource = require('eventsource');

const log = require('./logger');
const { doorActionEventSourcePath } = require('./env');
const {
	toggleOpenDoor,
	openDoor,
	closeDoor,
	openDoorTemporarily,
} = require('./door-relay');

const doorActionEventSource = new EventSource(doorActionEventSourcePath);
doorActionEventSource.onerror = (err) => {
	console.log('non-fatal error in fetching sse. Other sources will continue to run:', err);
};
doorActionEventSource.addEventListener('action', (e) => {
	const { data } = e;
	log(`receiving data "${data}"`);

	const [command, ...params] = data.split(' ');

	switch(command) {
		case 'toggle':
			toggleOpenDoor();
			break;
		case 'open':
			openDoor();
			break;
		case 'close':
			toggleOpenDoor();
			break;
		case 'open-temp':
			const [ ms=1000 ] = params;
			openDoorTemporarily(+ms);
			break;
	}
});
