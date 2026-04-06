import type {AuthenticatedMedusaRequest} from '@medusajs/framework/http'
import {IAuthModuleService, ProviderIdentityDTO} from '@medusajs/framework/types'
import {Modules} from '@medusajs/framework/utils'

export const getEmailpassProviderIdentity = async (
	req: AuthenticatedMedusaRequest
): Promise<{authModule: IAuthModuleService; providerIdentity: ProviderIdentityDTO | null}> => {
	const authModule = req.scope.resolve(Modules.AUTH)

	const authIdentity = await authModule.retrieveAuthIdentity(req.auth_context.auth_identity_id, {
		relations: ['provider_identities']
	})

	const providerIdentity = authIdentity.provider_identities?.find(pi => pi.provider === 'emailpass') ?? null

	return {authModule, providerIdentity}
}
