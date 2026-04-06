import {z} from 'zod'

const PluginOptionsSchema = z.object({
	passwordPolicy: z.string().optional()
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
}

export default PasswordManagerModuleService
