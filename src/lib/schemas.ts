import { z } from 'zod';

export const MemberInfo = z.object({
	set_at: z.number(),
	name: z.string(),
	status: z.enum(['point', 'response', 'poi', '']),
	room: z.enum(['council'])
});

export const MessageSubmission = MemberInfo.omit({ set_at: true, id: true });

export type IMember = z.infer<typeof MemberInfo>;

export const SSEvents = {
	council: 'council_Chat_set',
	general: 'chat_sent'
};
