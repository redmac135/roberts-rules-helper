import { nullable, z } from 'zod';

// TODO: as this is used in the map name => info, name is actually undefined for most of the time, should be omited
export const MemberInfo = z.object({
	set_at: z.number(),
	name: z.string().trim().min(1), // trim string then make sure there's at least 1 character
	status: z.enum(['point', 'response', 'poi', 'standby']),
	room: z.enum(['council'])
});

export const MessageSubmission = MemberInfo.omit({ set_at: true });
export const NameChangeSubmission = MemberInfo.omit({ set_at: true }).extend({
	previous: z.string().trim().min(1)
});

export type IMember = z.infer<typeof MemberInfo>;
const MemberUpdateMessage = MemberInfo.extend({ type: z.enum(['set', 'delete']) });
export type MemberUpdateMessage = z.infer<typeof MemberUpdateMessage>;

export const SSEvents = {
	council: 'council_chat_set',
	general: 'chat_sent'
};
