<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.stackd-solutions.io"><img src="https://raw.githubusercontent.com/StackD-Solutions/medusa-password-manager/main/docs/logo.svg" alt="StackD Solutions" width="250"></a>
  <br>Medusa Password Manager Plugin
  <br>
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackd-solutions/medusa-password-manager"><img src="https://img.shields.io/npm/v/@stackd-solutions/medusa-password-manager" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@stackd-solutions/medusa-password-manager"><img src="https://img.shields.io/npm/dm/@stackd-solutions/medusa-password-manager" alt="npm downloads"></a>
  <img src="https://img.shields.io/npm/l/@stackd-solutions/medusa-password-manager" alt="Apache License">
  <img src="https://img.shields.io/npm/types/@stackd-solutions/medusa-password-manager" alt="Types Included">
</p>

A [Medusa v2](https://medusajs.com/) plugin that adds password management for customers. Authenticated customers can change their password via the Store API, and password reset emails are sent automatically when a reset is requested. The plugin includes rate limiting, optional password policy enforcement, and integrates with Medusa's notification module.

## Features

- Store API endpoint for authenticated customers to change their password
- Rate limiting on password change attempts (5 per 15 minutes)
- Optional password policy enforcement via configurable regex
- Automatic password reset email via `auth.password_reset` subscriber
- Workflow and step for sending reset emails via Medusa's notification module
- Request validation with Zod schemas generated from the OpenAPI spec

## Prerequisites

This plugin sends password reset emails through Medusa's [Notification Module](https://docs.medusajs.com/resources/architectural-modules/notification). You need:

1. **A notification provider** configured for the `email` channel (e.g. SendGrid, Resend, SES, or any custom provider).
2. **An email template** named `reset-password` registered with your notification provider. The template receives the following data:

| Variable        | Type   | Description                                                |
| --------------- | ------ | ---------------------------------------------------------- |
| `customer_name` | string | The customer's first name (or empty string)                |
| `reset_url`     | string | Full URL the customer should click to reset their password |

## Installation

```bash
yarn add @stackd-solutions/medusa-password-manager
```

## Configuration

Register the plugin and its module in your `medusa-config.ts`:

```typescript
import {defineConfig} from '@medusajs/framework/utils'

export default defineConfig({
	// ... other config
	plugins: [
		{
			resolve: '@stackd-solutions/medusa-password-manager',
			options: {}
		}
	],
	modules: [
		{
			resolve: '@stackd-solutions/medusa-password-manager/modules/password-manager',
			options: {
				callbackUrl: 'https://mystore.com/password/reset',
				passwordPolicy: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'
			}
		}
	]
})
```

### Plugin Options

| Option           | Type     | Default      | Description                                                                                 |
| ---------------- | -------- | ------------ | ------------------------------------------------------------------------------------------- |
| `callbackUrl`    | `string` | **required** | Full URL the reset-password email will point customers to                                   |
| `passwordPolicy` | `string` | -            | Regex pattern that new passwords must match (e.g. minimum length, required character types) |

## API Endpoints

| Method | Endpoint                              | Scope | Auth | Description                                  |
| ------ | ------------------------------------- | ----- | ---- | -------------------------------------------- |
| POST   | `/store/customers/me/password/change` | Store | ✅   | Change the authenticated customer's password |

## Workflow

The plugin exposes a `sendResetPasswordEmailWorkflow` that can be used programmatically:

```typescript
import {sendResetPasswordEmailWorkflow} from '@stackd-solutions/medusa-password-manager/workflows/send-reset-password-email'

await sendResetPasswordEmailWorkflow(container).run({
	input: {
		email: 'customer@example.com',
		customer_name: 'John',
		callback_url: 'https://mystore.com/password/reset',
		token: 'reset-token'
	}
})
```

The workflow consists of a single step:

1. **send-notification** - Sends the email via the notification module using the `reset-password` template.

## Build

```bash
yarn build
```

This generates Zod schemas from the OpenAPI spec, runs `medusa plugin:build`, and builds type declarations.

## Development

Start the plugin in development/watch mode:

```bash
yarn dev
```

## Types

The plugin exports the following types:

```typescript
import type {
	ChangePasswordRequest,
	ChangePasswordResponse,
	ResetPasswordData,
	PasswordManagerPluginOptions,
	SendResetPasswordEmailInput
} from '@stackd-solutions/medusa-password-manager'
```

| Type                           | Description                                          |
| ------------------------------ | ---------------------------------------------------- |
| `ChangePasswordRequest`        | `{ current_password: string, new_password: string }` |
| `ChangePasswordResponse`       | `{ message: string }`                                |
| `ResetPasswordData`            | Event data for `auth.password_reset`                 |
| `PasswordManagerPluginOptions` | Plugin options (validated with Zod at startup)       |
| `SendResetPasswordEmailInput`  | Input for the reset password workflow                |

The module key is also exported:

```typescript
import {PASSWORD_MANAGER_MODULE} from '@stackd-solutions/medusa-password-manager'
```

## License

Apache 2.0
