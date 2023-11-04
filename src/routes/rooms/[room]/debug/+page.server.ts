import members from '$lib/server/state';
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async () => {
		try {
			members.clear();
		} catch (error) {
			return fail(500, { error: 'An unexpected error occurred.' });
		}
	}
};
