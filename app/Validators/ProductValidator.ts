import vine from '@vinejs/vine'

export const productValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2),
    amount: vine.number().min(1),
  })
)
