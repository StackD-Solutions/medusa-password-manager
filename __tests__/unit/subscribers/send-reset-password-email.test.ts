import {Modules} from '@medusajs/framework/utils'
import {PASSWORD_MANAGER_MODULE} from '../../../src/modules/password-manager'
import sendResetPasswordEmailHandler, {config} from '../../../src/subscribers/send-reset-password-email'
import {sendResetPasswordEmailWorkflow} from '../../../src/workflows/send-reset-password-email'
import {createMockCustomerModule, createMockPasswordManagerService} from '../helpers/mock-route'

jest.mock('../../../src/workflows/send-reset-password-email', () => ({
	sendResetPasswordEmailWorkflow: jest.fn()
}))

const mockRun = jest.fn()

const setup = (
	opts: {
		data?: Record<string, unknown>
		customerOverrides?: Partial<ReturnType<typeof createMockCustomerModule>>
		serviceOverrides?: Partial<ReturnType<typeof createMockPasswordManagerService>>
	} = {}
): {
	event: any
	container: any
	customerModule: ReturnType<typeof createMockCustomerModule>
	service: ReturnType<typeof createMockPasswordManagerService>
} => {
	const customerModule = createMockCustomerModule(opts.customerOverrides)
	const service = createMockPasswordManagerService(opts.serviceOverrides)
	const serviceMap: Record<string, unknown> = {
		[Modules.CUSTOMER]: customerModule,
		[PASSWORD_MANAGER_MODULE]: service
	}
	const container = {resolve: (key: string): unknown => serviceMap[key]}
	const event = {
		data: opts.data ?? {actor_type: 'customer', entity_id: 'user@test.com', token: 'tok_1'}
	}
	return {event, container, customerModule, service}
}

beforeEach(() => {
	mockRun.mockReset()
	;(sendResetPasswordEmailWorkflow as jest.Mock).mockReset()
	;(sendResetPasswordEmailWorkflow as jest.Mock).mockReturnValue({run: mockRun})
})

describe('config', () => {
	it('should subscribe to auth.password_reset', () => {
		expect(config).toEqual({event: 'auth.password_reset'})
	})
})

describe('sendResetPasswordEmailHandler', () => {
	it('should run workflow with customer first_name when customer is found', async () => {
		const {event, container, customerModule} = setup()
		customerModule.listCustomers.mockResolvedValue([{first_name: 'Alice'}])

		await sendResetPasswordEmailHandler({event, container} as any)

		expect(mockRun).toHaveBeenCalledWith({
			input: {
				email: 'user@test.com',
				customer_name: 'Alice',
				callback_url: 'https://store.test/password/reset',
				token: 'tok_1'
			}
		})
	})

	it('should run workflow with empty name when customer has no first_name', async () => {
		const {event, container, customerModule} = setup()
		customerModule.listCustomers.mockResolvedValue([{first_name: null}])

		await sendResetPasswordEmailHandler({event, container} as any)

		expect(mockRun).toHaveBeenCalledWith(expect.objectContaining({input: expect.objectContaining({customer_name: ''})}))
	})

	it('should run workflow with empty name when no customer is found', async () => {
		const {event, container, customerModule} = setup()
		customerModule.listCustomers.mockResolvedValue([])

		await sendResetPasswordEmailHandler({event, container} as any)

		expect(mockRun).toHaveBeenCalledWith(expect.objectContaining({input: expect.objectContaining({customer_name: ''})}))
	})

	it('should run workflow with empty name when customer lookup throws', async () => {
		const {event, container, customerModule} = setup()
		customerModule.listCustomers.mockRejectedValue(new Error('boom'))

		await sendResetPasswordEmailHandler({event, container} as any)

		expect(mockRun).toHaveBeenCalledWith(expect.objectContaining({input: expect.objectContaining({customer_name: ''})}))
	})

	it('should skip non-customer actor types', async () => {
		const {event, container, customerModule} = setup({data: {actor_type: 'user', entity_id: 'admin@test.com', token: 'tok_1'}})

		await sendResetPasswordEmailHandler({event, container} as any)

		expect(customerModule.listCustomers).not.toHaveBeenCalled()
		expect(mockRun).not.toHaveBeenCalled()
	})

	it('should use callback url from the password manager service', async () => {
		const {event, container, customerModule} = setup({serviceOverrides: {callbackUrl: 'https://other.test/reset'}})
		customerModule.listCustomers.mockResolvedValue([])

		await sendResetPasswordEmailHandler({event, container} as any)

		expect(mockRun).toHaveBeenCalledWith(expect.objectContaining({input: expect.objectContaining({callback_url: 'https://other.test/reset'})}))
	})
})
