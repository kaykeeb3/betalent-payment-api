import vine from '@vinejs/vine'

export const userValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(6),
    role: vine.enum(['admin', 'user']),
  })
)
