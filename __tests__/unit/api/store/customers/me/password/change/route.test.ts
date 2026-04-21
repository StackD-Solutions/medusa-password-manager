import {Modules} from '@medusajs/framework/utils'
import {POST} from '../../../../../../../../src/api/store/customers/me/password/change/route'
import {createMockAuthModule, createMockRequest, createMockResponse} from '../../../../../../helpers/mock-route'

const setup = (
	opts: {
		authIdentityId?: string | null
		body?: Record<string, unknown>
		authOverrides?: Partial<ReturnType<typeof createMockAuthModule>>
	} = {}
): {
	req: any
	res: ReturnType<typeof createMockResponse>
	authModule: ReturnType<typeof createMockAuthModule>
} => {
	const authModule = createMockAuthModule(opts.authOverrides)
	const res = createMockResponse()
	const req = createMockRequest({
		authIdentityId: 'authIdentityId' in opts ? opts.authIdentityId : 'auth_1',
		body: opts.body ?? {current_password: 'oldP@ss123', new_password: 'newP@ss123'},
		services: {[Modules.AUTH]: authModule}
	})
	return {req, res, authModule}
}

describe('POST /store/customers/me/password/change', () => {
	it('should update password and return 200 on success', async () => {
		const {req, res, authModule} = setup()
		authModule.retrieveAuthIdentity.mockResolvedValue({
			provider_identities: [{provider: 'emailpass', entity_id: 'user@test.com'}]
		})
		authModule.authenticate.mockResolvedValue({success: true})
		authModule.updateProvider.mockResolvedValue(undefined)

		await POST(req, res)

		expect(authModule.authenticate).toHaveBeenCalledWith('emailpass', {
			body: {email: 'user@test.com', password: 'oldP@ss123'}
		})
		expect(authModule.updateProvider).toHaveBeenCalledWith('emailpass', {
			entity_id: 'user@test.com',
			password: 'newP@ss123'
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({message: 'Password updated'})
	})

	it('should return 400 when retrieving auth identity fails', async () => {
		const {req, res, authModule} = setup()
		authModule.retrieveAuthIdentity.mockRejectedValue(new Error('boom'))

		await POST(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({message: 'Failed to retrieve auth identity'})
		expect(authModule.authenticate).not.toHaveBeenCalled()
	})

	it('should return 400 when no emailpass provider is found', async () => {
		const {req, res, authModule} = setup()
		authModule.retrieveAuthIdentity.mockResolvedValue({
			provider_identities: [{provider: 'google', entity_id: 'user@test.com'}]
		})

		await POST(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({message: 'No emailpass provider found for this account'})
		expect(authModule.authenticate).not.toHaveBeenCalled()
	})

	it('should return 401 when current password is incorrect', async () => {
		const {req, res, authModule} = setup()
		authModule.retrieveAuthIdentity.mockResolvedValue({
			provider_identities: [{provider: 'emailpass', entity_id: 'user@test.com'}]
		})
		authModule.authenticate.mockResolvedValue({success: false})

		await POST(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({message: 'Current password is incorrect'})
		expect(authModule.updateProvider).not.toHaveBeenCalled()
	})

	it('should return 500 when updateProvider fails', async () => {
		const {req, res, authModule} = setup()
		authModule.retrieveAuthIdentity.mockResolvedValue({
			provider_identities: [{provider: 'emailpass', entity_id: 'user@test.com'}]
		})
		authModule.authenticate.mockResolvedValue({success: true})
		authModule.updateProvider.mockRejectedValue(new Error('db down'))

		await POST(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({message: 'Failed to update password'})
	})
})
