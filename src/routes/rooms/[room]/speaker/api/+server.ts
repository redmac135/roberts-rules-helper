import { MessageSubmission, type MemberUpdateMessage, SSEvents } from '$lib/schemas.js';
import { chatEmitter } from '$lib/server/emitters.js';
import members from '$lib/server/state';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { name, room } = await request.json();
		const chatObj = {
			status: 'standby',
			room: room,
			name: name
		};
		const parsed = MessageSubmission.parse(chatObj);
		const message: MemberUpdateMessage = { set_at: Date.now(), type: 'set', ...parsed };
		members.set(chatObj.name, message);

		const roomEvent = SSEvents[message.room];
		chatEmitter.emit(SSEvents.general, message);
		chatEmitter.emit(roomEvent, message);
		return new Response('success', { status: 200 });
	} catch (error) {
		console.log(error);
		// TODO: implement better error handling
		return new Response('fail', { status: 400 });
	}
}
