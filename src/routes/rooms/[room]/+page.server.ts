import { members, activeRooms } from '$lib/server/state';
import {
	MemberInfo,
	NameChangeSubmission,
	SSEvents,
	type MemberUpdateMessage,
	StatusSubmission
} from '$lib/schemas';
import { chatEmitter } from '$lib/server/emitters';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { ZodError } from 'zod';
import { HEARTBEAT_INTERVAL } from '$lib';

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
			roomMembers,
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
				return fail(400, { formName: 'setstatus', error: 'Room is not active.' });
			}
			const useruid = parsed.useruid;
			if (!useruid) {
				return fail(400, { formName: 'setstatus', error: 'Missing useruid.' });
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

			return { success: true };
		} catch (error) {
			if (error instanceof ZodError) {
				const textError = error.issues.find((iss) => iss.path.includes('text'));
				if (textError) {
					return fail(400, { formName: 'setstatus', error: textError.message });
				}
			}
			return fail(500, { formName: 'setstatus', error: 'An unexpected error occurred.' });
		}
	},
	changename: async ({ request }) => {
		try {
			const formData = await request.formData();
			const chatObj = {
				useruid: formData.get('useruid'),
				room: formData.get('room'),
				name: formData.get('name'),
				status: formData.get('status')
			};
			// TODO: fix this bandaid solution to zod not throwing error when name.length == 0
			if (chatObj.name?.toString().length === 0) {
				return fail(400, { formName: 'changename', error: 'Name cannot be blank.' });
			}
			const parsed = NameChangeSubmission.parse(chatObj);
			const newuseruid = parsed.useruid;
			if (!newuseruid) {
				return fail(400, { formName: 'changename', error: 'Missing useruid.' });
			}
			const newMemberInfo: MemberUpdateMessage = {
				set_at: Date.now(),
				type: 'set',
				useruid: newuseruid,
				name: parsed.name,
				status: parsed.status,
				room: parsed.room
			};
			chatEmitter.emit(SSEvents[newMemberInfo.room], [newuseruid, newMemberInfo]);

			return { success: true };
		} catch (error) {
			if (error instanceof ZodError) {
				const textError = error.issues.find((iss) => iss.path.includes('text'));
				if (textError) {
					return fail(400, { formName: 'changename', error: textError.message });
				}
			}
			return fail(500, { formName: 'changename', error: 'An unexpected error occurred.' }); // TODO: make work
		}
	}
} satisfies Actions;
