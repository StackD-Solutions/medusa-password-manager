import type {AuthenticatedMedusaRequest} from '@medusajs/framework/http'
import {Modules} from '@medusajs/framework/utils'
import {getEmailpassProviderIdentity} from '../../../src/utils/utils'

const mockRetrieveAuthIdentity = jest.fn()

const mockRequest = (authIdentityId: string): AuthenticatedMedusaRequest =>
	({
		scope: {
			resolve: (module: string) => {
				if (module === Modules.AUTH) {
					return {retrieveAuthIdentity: mockRetrieveAuthIdentity}
				}
				throw new Error(`Unexpected module: ${module}`)
			}
		},
		auth_context: {auth_identity_id: authIdentityId}
	}) as unknown as AuthenticatedMedusaRequest

beforeEach(() => {
	mockRetrieveAuthIdentity.mockReset()
})

describe('getEmailpassProviderIdentity', () => {
	it('should return the emailpass provider identity', async () => {
		const emailpassIdentity = {provider: 'emailpass', id: 'pi_1'}
		mockRetrieveAuthIdentity.mockResolvedValue({
			provider_identities: [{provider: 'google', id: 'pi_0'}, emailpassIdentity]
		})

		const result = await getEmailpassProviderIdentity(mockRequest('auth_123'))

		expect(mockRetrieveAuthIdentity).toHaveBeenCalledWith('auth_123', {relations: ['provider_identities']})
		expect(result.providerIdentity).toBe(emailpassIdentity)
		expect(result.authModule).toEqual({retrieveAuthIdentity: mockRetrieveAuthIdentity})
	})

	it('should return null when no emailpass provider exists', async () => {
		mockRetrieveAuthIdentity.mockResolvedValue({
			provider_identities: [{provider: 'google', id: 'pi_0'}]
		})

		const result = await getEmailpassProviderIdentity(mockRequest('auth_456'))

		expect(result.providerIdentity).toBeNull()
	})

	it('should return null when provider_identities is undefined', async () => {
		mockRetrieveAuthIdentity.mockResolvedValue({})

		const result = await getEmailpassProviderIdentity(mockRequest('auth_789'))

		expect(result.providerIdentity).toBeNull()
	})
})
