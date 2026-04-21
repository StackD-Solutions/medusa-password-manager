import PasswordManagerModuleService from '../../../../src/modules/password-manager/service'

const REQUIRED_OPTIONS = {
	callbackUrl: 'https://store.test/password/reset'
}

describe('PasswordManagerModuleService', () => {
	describe('constructor', () => {
		it('should accept valid options', () => {
			expect(() => new PasswordManagerModuleService({}, REQUIRED_OPTIONS)).not.toThrow()
		})

		it('should throw when callbackUrl is missing', () => {
			expect(() => new PasswordManagerModuleService({}, {})).toThrow()
		})

		it('should throw when callbackUrl is not a url', () => {
			expect(() => new PasswordManagerModuleService({}, {callbackUrl: 'not-a-url'})).toThrow()
		})
	})

	describe('passwordPolicy', () => {
		it('should return a RegExp when passwordPolicy option is set', () => {
			const service = new PasswordManagerModuleService({}, {...REQUIRED_OPTIONS, passwordPolicy: '^.{8,}$'})
			expect(service.passwordPolicy).toBeInstanceOf(RegExp)
			expect(service.passwordPolicy?.test('longenough')).toBe(true)
			expect(service.passwordPolicy?.test('short')).toBe(false)
		})

		it('should return undefined when passwordPolicy option is not set', () => {
			const service = new PasswordManagerModuleService({}, REQUIRED_OPTIONS)
			expect(service.passwordPolicy).toBeUndefined()
		})
	})

	describe('callbackUrl', () => {
		it('should return the configured url', () => {
			const service = new PasswordManagerModuleService({}, REQUIRED_OPTIONS)
			expect(service.callbackUrl).toBe('https://store.test/password/reset')
		})
	})
})
