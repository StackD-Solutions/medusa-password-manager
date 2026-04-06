import type {SubscriberArgs, SubscriberConfig} from '@medusajs/framework'
import {Modules} from '@medusajs/framework/utils'
import type {ResetPasswordData} from '../types'
import {sendResetPasswordEmailWorkflow} from '../workflows/send-reset-password-email'

const sendResetPasswordEmailHandler = async ({event: {data}, container}: SubscriberArgs<ResetPasswordData>): Promise<void> => {
	if (data.actor_type !== 'customer') {
		return
	}

	const customerModule = container.resolve(Modules.CUSTOMER)
	const callbackUrl = process.env.STOREFRONT_URL || process.env.STORE_CORS?.split(',')[0]

	let customerName = ''
	try {
		const [customer] = await customerModule.listCustomers({email: data.entity_id})
		if (customer) {
			customerName = customer.first_name || ''
		}
	} catch {
		// Customer lookup failed, proceed without name
	}

	await sendResetPasswordEmailWorkflow(container).run({
		input: {
			email: data.entity_id,
			customer_name: customerName,
			callback_url: callbackUrl + '/password/reset',
			token: data.token
		}
	})
}

export const config: SubscriberConfig = {
	event: 'auth.password_reset'
}

export default sendResetPasswordEmailHandler
