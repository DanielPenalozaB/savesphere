import { z } from 'zod';

export const aiUnavailableReason = z.enum(['not_configured', 'invalid_key', 'disabled_by_user']);
export const channelUnavailableReason = z.enum(['not_configured']);

export const capabilitiesSchema = z.object({
	ai: z.object({
		available: z.boolean(),
		reason: aiUnavailableReason.nullable(),
		source: z.enum(['user', 'instance']).nullable()
	}),
	channels: z.object({
		telegram: z.object({
			available: z.boolean(),
			linked: z.boolean(),
			reason: channelUnavailableReason.nullable()
		}),
		whatsapp: z.object({
			available: z.boolean(),
			linked: z.boolean(),
			reason: channelUnavailableReason.nullable()
		})
	})
});
export type Capabilities = z.infer<typeof capabilitiesSchema>;
