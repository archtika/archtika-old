import { Static, Type } from '@sinclair/typebox'

export const createAccountSchema = Type.Object({
    username: Type.String(),
    email: Type.String(),
    password: Type.String({ minLength: 8, maxLength: 64 }),
})

export type CreateAccountSchema = Static<typeof createAccountSchema>

export const createAccountResponseSchema = Type.Object({
    account_id: Type.String(),
    username: Type.String(),
    email: Type.String(),
})

export type CreateAccountResponseSchema = Static<
    typeof createAccountResponseSchema
>

export const loginSchema = Type.Object({
    email: Type.String(),
    password: Type.String({ minLength: 8, maxLength: 64 }),
})

export type LoginSchema = Static<typeof loginSchema>

export const emailVerificationSchema = Type.Object({
    code: Type.String({ minLength: 8, maxLength: 8 }),
})

export type EmailVerificationSchema = Static<typeof emailVerificationSchema>

export const verifyPasswordResetTokenSchema = Type.Object({
    password: Type.String({ minLength: 8, maxLength: 64 }),
})

export type VerifyPasswordResetTokenSchema = Static<
    typeof verifyPasswordResetTokenSchema
>

export const validateTwoFactorSchema = Type.Object({
    otp: Type.String(),
})

export type ValidateTwoFactorSchema = Static<typeof validateTwoFactorSchema>
