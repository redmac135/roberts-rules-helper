import { z } from 'zod';

// TODO: as this is used in the map name => info, name is actually undefined for most of the time, should be omited
export const MemberData = z.object({
	useruid: z.string().length(36),
	set_at: z.number(),
	name: z.string().trim().min(1), // trim string then make sure there's at least 1 character
	status: z.enum(['point', 'response', 'poi', 'standby']),
	room: z.enum(['council'])
});

export const MemberInfo = MemberData.omit({ useruid: true });

export const StatusSubmission = MemberData.omit({ set_at: true });
export const NameChangeSubmission = MemberData.omit({ set_at: true });

export type IMember = z.infer<typeof MemberInfo>;
const MemberUpdateMessage = MemberData.extend({ type: z.enum(['set', 'changename']) });
export type MemberUpdateMessage = z.infer<typeof MemberUpdateMessage>;

export const SSEvents = {
	council: 'council_update',
	general: 'chat_sent'
};

export const HeartBeat = { beat: 'beat' };
