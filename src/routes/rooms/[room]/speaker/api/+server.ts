import { StatusSubmission, type MemberUpdateMessage, SSEvents } from '$lib/schemas.js';
import { chatEmitter } from '$lib/server/emitters.js';
import { members } from '$lib/server/state';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { uid, name, room } = await request.json();
		const chatObj = {
			useruid: uid,
			name: name,
			room: room,
			status: 'standby'
		};
		const parsed = StatusSubmission.parse(chatObj);
		const message: MemberUpdateMessage = { set_at: Date.now(), type: 'set', ...parsed };
		members.set(parsed.useruid, message);

		chatEmitter.emit(SSEvents.general, [parsed.useruid, message]);
		chatEmitter.emit(SSEvents[message.room], [parsed.useruid, message]);
		return new Response('success', { status: 200 });
	} catch (error) {
		console.log(error);
		// TODO: implement better error handling
		return new Response('fail', { status: 400 });
	}
}
