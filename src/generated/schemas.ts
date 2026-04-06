import {z} from 'zod'

export const ChangePasswordRequest = z.object({current_password: z.string().min(1), new_password: z.string().min(1)})
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequest>
export const ChangePasswordResponse = z.object({message: z.string()})
export type ChangePasswordResponse = z.infer<typeof ChangePasswordResponse>
export const Error = z.object({message: z.string(), code: z.string().optional()})
export type Error = z.infer<typeof Error>
export const ResetPasswordData = z.object({entity_id: z.string(), token: z.string(), actor_type: z.string()})
export type ResetPasswordData = z.infer<typeof ResetPasswordData>
