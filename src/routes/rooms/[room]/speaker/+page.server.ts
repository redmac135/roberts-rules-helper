import { members, activeRooms } from '$lib/server/state';
import { MemberInfo, StatusSubmission, SSEvents, type MemberUpdateMessage } from '$lib/schemas';
import { chatEmitter, startHeartbeat } from '$lib/server/emitters';
import type { PageServerLoad, Actions } from '../$types';
import { error, fail } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { HEARTBEAT_INTERVAL } from '$lib';

export const load = (async ({ params }) => {
	const { room: roomId } = params;
	const isRoute = MemberInfo.pick({ room: true }).safeParse(params);
	if (!isRoute.success) throw error(404, 'There be dragons...');
	const title = roomId;
	const roomMembers = members;
	const roomActive = activeRooms.has(roomId);
	return {
		room: {
			id: roomId,
			title,
			roomMembers,
			roomActive,
			heartbeatInterval: HEARTBEAT_INTERVAL
		}
	};
}) satisfies PageServerLoad;

export const actions = {
	setstatus: async ({ request }) => {
		try {
			const formData = await request.formData();
			const chatObj = {
				useruid: formData.get('useruid'),
				name: formData.get('name'),
				status: formData.get('status'),
				room: formData.get('room')
			};
			const parsed = StatusSubmission.parse(chatObj);
			if (!activeRooms.has(parsed.room)) {
				return fail(400, { error: 'Room is not active.' });
			}
			const useruid = parsed.useruid;
			if (!useruid) {
				return fail(400, { error: 'Missing useruid.' });
			}
			if (members.get(useruid) === undefined) {
				members.set(useruid, {
					set_at: Date.now(),
					name: parsed.name,
					status: parsed.status,
					room: parsed.room
				});
			}
			const message: MemberUpdateMessage = {
				set_at: Date.now(),
				type: 'set',
				useruid,
				name: parsed.name,
				status: parsed.status,
				room: parsed.room
			};
			members.set(useruid, message);

			chatEmitter.emit(SSEvents.general, [useruid, message]);
			chatEmitter.emit(SSEvents[message.room], [useruid, message]);
		} catch (error) {
			if (error instanceof ZodError) {
				const textError = error.issues.find((iss) => iss.path.includes('text'));
				if (textError) {
					return fail(400, { error: textError.message });
				}
			}
			return fail(500, { error: 'An unexpected error occurred.' });
		}
	},
	start: async ({ request }) => {
		const formData = await request.formData();
		const room = formData.get('room');
		if (room === null) {
			return fail(400, { error: 'Missing room param.' });
		}

		// if room is already in activeRooms, return
		if (activeRooms.has(room.toString())) {
			startHeartbeat();
			return { status: 200 };
		}

		activeRooms.add(room.toString());

		startHeartbeat();

		return { status: 200 };
	}
} satisfies Actions;
