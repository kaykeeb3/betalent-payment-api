import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ProductValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.minLength(2)]),
    amount: schema.number([rules.unsigned(), rules.range(1, 99999999)]),
  })

  public messages = {
    'name.required': 'O nome do produto é obrigatório',
    'amount.required': 'O valor do produto é obrigatório',
    'amount.min': 'O valor deve ser maior que zero',
  }
}
