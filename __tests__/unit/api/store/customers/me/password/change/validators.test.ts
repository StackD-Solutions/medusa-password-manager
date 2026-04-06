import {ChangePasswordRequestSchema} from '../../../../../../../../src/api/store/customers/me/password/change/validators'

describe('ChangePasswordRequestSchema', () => {
	it('should accept valid request', () => {
		const result = ChangePasswordRequestSchema.safeParse({current_password: 'oldP@ss123', new_password: 'secureP@ss123'})
		expect(result.success).toBe(true)
		expect(result.data).toEqual({current_password: 'oldP@ss123', new_password: 'secureP@ss123'})
	})

	it('should reject missing current_password', () => {
		const result = ChangePasswordRequestSchema.safeParse({new_password: 'secureP@ss123'})
		expect(result.success).toBe(false)
	})

	it('should reject missing new_password', () => {
		const result = ChangePasswordRequestSchema.safeParse({current_password: 'oldP@ss123'})
		expect(result.success).toBe(false)
	})

	it('should reject non-string current_password', () => {
		const result = ChangePasswordRequestSchema.safeParse({current_password: 123, new_password: 'secureP@ss123'})
		expect(result.success).toBe(false)
	})

	it('should reject non-string new_password', () => {
		const result = ChangePasswordRequestSchema.safeParse({current_password: 'oldP@ss123', new_password: 123})
		expect(result.success).toBe(false)
	})
})
