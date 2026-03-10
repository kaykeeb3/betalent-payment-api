import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PurchaseValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    client: schema.object().members({
      name: schema.string({ trim: true }, [rules.minLength(3)]),
      email: schema.string({ trim: true }, [rules.email()]),
    }),
    products: schema.array([rules.minLength(1)]).members(
      schema.object().members({
        product_id: schema.number(),
        quantity: schema.number([rules.range(1, 100)]),
      })
    ),
    card: schema.object().members({
      number: schema.string({ trim: true }, [rules.minLength(13), rules.maxLength(19)]),
      cvv: schema.string({ trim: true }, [rules.minLength(3), rules.maxLength(4)]),
    }),
  })

  public messages = {
    'client.name.required': 'O nome do cliente é obrigatório',
    'client.email.email': 'O email informado é inválido',
    'products.required': 'Pelo menos um produto deve ser informado',
    'card.number.required': 'O número do cartão é obrigatório',
    'card.cvv.required': 'O CVV é obrigatório',
  }
}
