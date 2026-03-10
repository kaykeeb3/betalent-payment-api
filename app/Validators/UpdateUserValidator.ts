import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string.optional({ trim: true }, [rules.email()]),
    password: schema.string.optional({}, [rules.minLength(6)]),
    role: schema.enum.optional(['admin', 'user'] as const),
  })

  public messages = {
    'email.email': 'O formato do email é inválido',
    'password.minLength': 'A senha deve ter pelo menos 6 caracteres',
    'role.enum': 'O cargo deve ser admin ou user',
  }
}
