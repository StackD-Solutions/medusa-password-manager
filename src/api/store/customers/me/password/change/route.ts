import type {AuthenticatedMedusaRequest, MedusaResponse} from '@medusajs/framework/http'
import {getEmailpassProviderIdentity} from '../../../../../../utils/utils'
import type {ChangePasswordRequest} from './validators'

export const POST = async (req: AuthenticatedMedusaRequest<ChangePasswordRequest>, res: MedusaResponse): Promise<MedusaResponse> => {
	const {current_password, new_password} = req.body

	let authModule: Awaited<ReturnType<typeof getEmailpassProviderIdentity>>['authModule']
	let providerIdentity: Awaited<ReturnType<typeof getEmailpassProviderIdentity>>['providerIdentity']

	try {
		;({authModule, providerIdentity} = await getEmailpassProviderIdentity(req))
	} catch {
		return res.status(400).json({message: 'Failed to retrieve auth identity'})
	}

	if (!providerIdentity) {
		return res.status(400).json({message: 'No emailpass provider found for this account'})
	}

	const {success} = await authModule.authenticate('emailpass', {
		body: {
			email: providerIdentity.entity_id,
			password: current_password
		}
	})

	if (!success) {
		return res.status(401).json({message: 'Current password is incorrect'})
	}

	try {
		await authModule.updateProvider('emailpass', {
			entity_id: providerIdentity.entity_id,
			password: new_password
		})
	} catch {
		return res.status(500).json({message: 'Failed to update password'})
	}

	return res.status(200).json({message: 'Password updated'})
}
