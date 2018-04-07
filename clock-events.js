const log = require('./logger');
const {
	openDoor,
	closeDoor,
} = require('./door-relay');

// specificity is top-down. An "all" at the bottom overrides everything
// "sun 06:00-01:00" means that on sunday, the doors will be closed at 01:00 on SUNDAY, not monday
const script = `
	all 07:00-01:00
	sun 06:00-01:00
`

const scriptLegend = {
	frequencies: {
		days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],

		workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
		weekendDays: ['sat', 'sun'],

		workDaysToken: 'wrk',
		weekendDaysToken: 'wkd',
		everyDayToken: 'all',
	},
}
const hourAndMinuteToMS = (hour, minute) =>
	hour * 3600 * 1000 +
	minute * 60 * 1000;

const hourAndMinuteStringToMS = (str) => hourAndMinuteToMS(...str.split(':').map(Number));

const parseScript = (script) => script
	.split('\n')
	.map(line => line.trim())
	.filter(line => line.length > 0)
	.map(line => {
		const [dayToken, timeRangeString] = line.split(' ');
		
		const [openTime, closeTime] = timeRangeString.split('-').map(hourAndMinuteStringToMS);

		const days = [];

		if(scriptLegend.frequencies.days.includes(dayToken)) {
			days.push(scriptLegend.frequencies.days.indexOf(dayToken));	
		} else if(scriptLegend.frequencies.workDaysToken === dayToken) {
			days.push(...scriptLegend.frequencies.workDays.map((day) => scriptLegend.frequencies.days.indexOf(day)));
		} else if(scriptLegend.frequencies.weekendDaysToken === dayToken) {
			days.push(...scriptLegend.frequencies.weekendDays.map((day) => scriptLegend.frequencies.days.indexOf(day)));
		} else if(scriptLegend.frequencies.everyDayToken === dayToken) {
			days.push(...scriptLegend.frequencies.days.map((_, i) => i));	
		}

		return {
			openTime,
			closeTime,
			days,
		}
	});

// this line will error (and log it in the console) if something goes wrong, so something is logged either way
const scriptEvents = parseScript(script);
log('script events parsed without errors');

const timezoneShift = +2 * 3600 * 1000;
const shouldDoorsBeOpen = (time=new Date(Date.now() + timezoneShift), events=scriptEvents) => {
	const day = time.getDay() - 1;	
	const ms = hourAndMinuteToMS(time.getHours(), time.getMinutes());

	return events.reduce((shouldBeOpen, { days, openTime, closeTime }) => {
		if(days.includes(day)) {
			const closesBeforeMidnight = closeTime > openTime;
	
			const isAfterOpen = closesBeforeMidnight
				? ms > openTime
				: ms > openTime || ms < closeTime;
			const isBeforeClose = closesBeforeMidnight
				? ms < closeTime
				: ms < closeTime || ms > openTime;
			
			return isAfterOpen && isBeforeClose; 
		} else {
			return shouldBeOpen;	
		}
	}, true);
}


module.exports = {
	shouldDoorsBeOpen,
}
