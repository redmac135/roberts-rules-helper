import { HEARTBEAT_INTERVAL } from '$lib';
import { SSEvents, HeartBeat } from '$lib/schemas';
import { activeRooms } from './state';
import { EventEmitter } from 'events';

EventEmitter.defaultMaxListeners = 150;
export const chatEmitter = new EventEmitter();

let heart: NodeJS.Timeout | undefined;

export function stopHeartbeat() {
	if (heart) {
		clearInterval(heart);
		heart = undefined;
	}
}

export const startHeartbeat = () => {
	stopHeartbeat();
	heart = setInterval(() => {
		console.log(new Date().toLocaleTimeString('en-US'), 'Heartbeat');
		activeRooms.forEach((room) => {
			chatEmitter.emit(SSEvents[room as keyof typeof SSEvents], HeartBeat);
		});
	}, HEARTBEAT_INTERVAL);
};
