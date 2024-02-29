import { FormatRegistry } from '@sinclair/typebox'

const email =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i

function IsEmail(value: string): boolean {
    return email.test(value)
}

function isWhiteSpaceOnly(value: string): boolean {
    return value.trim().length === 0
}

FormatRegistry.Set('whitespace', isWhiteSpaceOnly)
FormatRegistry.Set('email', IsEmail)
