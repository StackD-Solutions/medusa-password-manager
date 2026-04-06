import {Module} from '@medusajs/framework/utils'
import PasswordManagerModuleService from './service'

export const PASSWORD_MANAGER_MODULE = 'passwordManager'

export default Module(PASSWORD_MANAGER_MODULE, {
	service: PasswordManagerModuleService
})
