import { z } from 'zod';
import { currencyCode } from './common.js';

export const userSettingsSchema = z.object({
	baseCurrency: currencyCode,
	timezone: z.string().min(1),
	locale: z.string().min(2),
	weekStartsOn: z.number().int().min(0).max(6),
	monthStartDay: z.number().int().min(1).max(28),
	aiEnabled: z.boolean()
});
export type UserSettings = z.infer<typeof userSettingsSchema>;

export const updateUserSettingsSchema = userSettingsSchema.partial();
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
