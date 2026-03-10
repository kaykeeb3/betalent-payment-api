import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateProductValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.optional({ trim: true }, [rules.minLength(2)]),
    amount: schema.number.optional([rules.unsigned(), rules.range(1, 99999999)]),
  })

  public messages = {
    'name.minLength': 'O nome deve ter pelo menos 2 caracteres',
    'amount.range': 'O valor deve ser maior que zero',
  }
}
