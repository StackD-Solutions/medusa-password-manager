type MockJson = jest.Mock
type MockStatus = jest.Mock

export type MockResponse = {
	status: MockStatus
	json: MockJson
}

export type MockAuthModule = {
	retrieveAuthIdentity: jest.Mock
	authenticate: jest.Mock
	updateProvider: jest.Mock
}

export type MockCustomerModule = {
	listCustomers: jest.Mock
}

export type MockPasswordManagerService = {
	passwordPolicy: RegExp | undefined
	callbackUrl: string
}

export const createMockResponse = (): MockResponse => {
	const json = jest.fn()
	const status = jest.fn().mockReturnValue({json})
	return {status, json}
}

export const createMockAuthModule = (overrides?: Partial<MockAuthModule>): MockAuthModule => ({
	retrieveAuthIdentity: jest.fn(),
	authenticate: jest.fn(),
	updateProvider: jest.fn(),
	...overrides
})

export const createMockCustomerModule = (overrides?: Partial<MockCustomerModule>): MockCustomerModule => ({
	listCustomers: jest.fn(),
	...overrides
})

export const createMockPasswordManagerService = (overrides?: Partial<MockPasswordManagerService>): MockPasswordManagerService => ({
	passwordPolicy: undefined,
	callbackUrl: 'https://store.test/password/reset',
	...overrides
})

export const createMockRequest = (opts: {
	params?: Record<string, string>
	query?: Record<string, string>
	body?: Record<string, unknown>
	authIdentityId?: string | null
	services?: Record<string, unknown>
}): Record<string, unknown> => {
	const serviceMap: Record<string, unknown> = opts.services || {}

	return {
		params: opts.params || {},
		query: opts.query || {},
		body: opts.body || {},
		auth_context: opts.authIdentityId ? {auth_identity_id: opts.authIdentityId} : undefined,
		scope: {
			resolve: (key: string): unknown => serviceMap[key]
		}
	}
}
