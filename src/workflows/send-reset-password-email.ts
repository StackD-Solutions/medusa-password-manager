import {createWorkflow, transform, WorkflowResponse} from '@medusajs/framework/workflows-sdk'
import {sendNotificationStep} from './steps/send-notification'
import type {SendResetPasswordEmailInput} from './types'

export const sendResetPasswordEmailWorkflow = createWorkflow('send-reset-password-email', (input: SendResetPasswordEmailInput) => {
	const notificationData = transform({input}, data => ({
		to: data.input.email,
		channel: 'email',
		template: 'reset-password',
		data: {
			customer_name: data.input.customer_name,
			reset_url: `${data.input.callback_url}?token=${data.input.token}&email=${data.input.email}`
		}
	}))

	const notification = sendNotificationStep(notificationData)

	return new WorkflowResponse(notification)
})
