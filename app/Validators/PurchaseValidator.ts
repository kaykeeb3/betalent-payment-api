import vine from '@vinejs/vine'

export const purchaseValidator = vine.compile(
  vine.object({
    client: vine.object({
      name: vine.string().minLength(3),
      email: vine.string().email(),
    }),
    products: vine.array(
      vine.object({
        product_id: vine.number(),
        quantity: vine.number().min(1).max(100),
      })
    ).minLength(1),
    card: vine.object({
      number: vine.string().minLength(13).maxLength(19),
      cvv: vine.string().minLength(3).maxLength(4),
    }),
  })
)
