import members from '$lib/server/state';
import {
	MemberInfo,
	NameChangeSubmission,
	SSEvents,
	type MemberUpdateMessage,
	StatusSubmission
} from '$lib/schemas';
import { chatEmitter } from '$lib/server/emitters';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
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
				useruid: formData.get('useruid'),
				name: formData.get('name'),
				status: formData.get('status'),
				room: formData.get('room')
			};
			const parsed = StatusSubmission.parse(chatObj);
			const useruid = parsed.useruid;
			//@ts-ignore
			delete parsed.useruid;
			if (members.get(useruid) === undefined) {
				members.set(useruid, { set_at: Date.now(), ...parsed });
			}
			const message: MemberUpdateMessage = {
				set_at: Date.now(),
				type: 'set',
				...parsed
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
				return fail(400, { error: 'Name cannot be blank.' });
			}
			const parsed = NameChangeSubmission.parse(chatObj);
			const newuseruid = parsed.useruid;
			//@ts-ignore
			delete parsed.useruid;
			const newMemberInfo: MemberUpdateMessage = { set_at: Date.now(), type: 'set', ...parsed };
			chatEmitter.emit(SSEvents[newMemberInfo.room], [newuseruid, newMemberInfo]);
		} catch (error) {
			if (error instanceof ZodError) {
				const textError = error.issues.find((iss) => iss.path.includes('text'));
				if (textError) {
					return fail(400, { error: textError.message });
				}
			}
			return fail(500, { error: 'An unexpected error occurred.' }); // TODO: make work
		}
	}
} satisfies Actions;
