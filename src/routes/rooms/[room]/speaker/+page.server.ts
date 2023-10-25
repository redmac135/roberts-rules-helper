import members from '$lib/server/state';
import { MemberInfo, MessageSubmission, SSEvents, type MemberUpdateMessage } from '$lib/schemas';
import { chatEmitter } from '$lib/server/emitters';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { ZodError } from 'zod';

export const load = (async ({ params }) => {
	const { room: roomId } = params;
	const isRoute = MemberInfo.pick({ room: true }).safeParse(params);
	if (!isRoute.success) throw error(404, 'There be dragons...');
	const title = roomId;
	const roomMembers = members;
	return {
		room: {
			id: roomId,
			title,
			roomMembers
		}
	};
}) satisfies PageServerLoad;

export const actions = {
	setstatus: async ({ request }) => {
		try {
			const formData = await request.formData();
			const chatObj = {
				status: formData.get('status'),
				room: formData.get('room'),
				name: formData.get('name')
			};
			const parsed = MessageSubmission.parse(chatObj);
			const message: MemberUpdateMessage = { set_at: Date.now(), type: 'set', ...parsed };

			members.set(parsed.name, message);

			const roomEvent = SSEvents[message.room];
			chatEmitter.emit(SSEvents.general, message);
			chatEmitter.emit(roomEvent, message);
		} catch (error) {
			if (error instanceof ZodError) {
				const textError = error.issues.find((iss) => iss.path.includes('text'));
				if (textError) {
					return fail(400, { error: textError.message });
				}
			}
			return fail(500, { error: 'An unexpected error occurred.' });
		}
	}
} satisfies Actions;
