import { stopHeartbeat } from '$lib/server/emitters';
import { members, activeRooms } from '$lib/server/state';
import { fail } from '@sveltejs/kit';

export const actions = {
	deleteUserData: async () => {
		try {
			members.clear();
		} catch (error) {
			return fail(500, { error: 'An unexpected error occurred.' });
		}
	},
	deactivateRooms: async () => {
		try {
			activeRooms.clear();
			stopHeartbeat();
		} catch (error) {
			return fail(500, { error: 'An unexpected error occurred.' });
		}
	}
};
