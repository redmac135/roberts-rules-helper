import type { IMember } from '$lib/schemas';

// Map uid -> IMember
export const members = new Map<string, IMember>();
export const activeRooms = new Set<string>();
