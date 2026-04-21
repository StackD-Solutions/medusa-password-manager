import {z} from 'zod'

const PluginOptionsSchema = z.object({
	passwordPolicy: z.string().optional(),
	callbackUrl: z.string().url()
})

export type PasswordManagerPluginOptions = z.infer<typeof PluginOptionsSchema>

class PasswordManagerModuleService {
	private readonly pluginOptions_: PasswordManagerPluginOptions
	private readonly passwordPolicyRegex_: RegExp | undefined

	constructor(_container: Record<string, unknown>, options: Record<string, unknown>) {
		this.pluginOptions_ = PluginOptionsSchema.parse(options)
		this.passwordPolicyRegex_ = this.pluginOptions_.passwordPolicy ? new RegExp(this.pluginOptions_.passwordPolicy) : undefined
	}

	get passwordPolicy(): RegExp | undefined {
		return this.passwordPolicyRegex_
	}

	get callbackUrl(): string {
		return this.pluginOptions_.callbackUrl
	}
}

export default PasswordManagerModuleService
