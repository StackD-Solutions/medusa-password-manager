import type {MedusaNextFunction, MedusaRequest, MedusaResponse} from '@medusajs/framework/http'
import {defineMiddlewares, authenticate, validateAndTransformBody} from '@medusajs/framework/http'
import rateLimit from 'express-rate-limit'
import {PASSWORD_MANAGER_MODULE} from '../modules/password-manager'
import type PasswordManagerModuleService from '../modules/password-manager/service'
import {ChangePasswordRequestSchema, type ChangePasswordRequest} from './store/customers/me/password/change/validators'

const passwordChangeRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5,
	message: {message: 'Too many password change attempts, please try again later'}
})

const validatePasswordPolicy = (req: MedusaRequest<ChangePasswordRequest>, res: MedusaResponse, next: MedusaNextFunction): void => {
	const service: PasswordManagerModuleService = req.scope.resolve(PASSWORD_MANAGER_MODULE)
	const policy = service.passwordPolicy

	if (policy && !policy.test(req.body.new_password)) {
		res.status(400).json({message: 'Password does not meet the required policy'})
		return
	}

	next()
}

export default defineMiddlewares({
	routes: [
		{
			matcher: '/store/customers/me/password/change',
			method: 'POST',
			middlewares: [
				passwordChangeRateLimit,
				authenticate('customer', ['session']),
				validateAndTransformBody(ChangePasswordRequestSchema),
				validatePasswordPolicy
			]
		}
	]
})
