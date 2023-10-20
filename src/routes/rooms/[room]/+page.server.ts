import members from '$lib/server/state';
import { MemberInfo, MessageSubmission, SSEvents, type IMember } from '$lib/schemas';
import { chatEmitter } from '$lib/server/emitters';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { randomUUID } from 'crypto';

export const load = (async ({ params }) => {
	const { room: roomId } = params;
	const isRoute = MemberInfo.pick({ room: true }).safeParse(params);
	if (!isRoute.success) throw error(404, 'There be dragons...');
	const title = roomId === 'council';
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
	default: async ({ request }) => {
		try {
			const formData = await request.formData();
			const chatObj = {
				status: formData.get('status'),
				room: formData.get('room'),
				name: formData.get('name')
			};
			const parsed = MessageSubmission.parse(chatObj);
			const id = randomUUID();
			const message: IMember = { set_at: Date.now(), ...parsed };

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
