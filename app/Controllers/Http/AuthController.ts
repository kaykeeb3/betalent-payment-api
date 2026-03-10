import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
  public async login({ request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    const user = await User.query().where('email', email).first()

    if (!user || !(await Hash.verify(user.password, password))) {
      return response.unauthorized({
        success: false,
        message: 'Credenciais inválidas',
      })
    }

    // Geração de token simples (base64 contendo email e role para o desafio Nível 2)
    const token = Buffer.from(`${user.email}:${user.role}:${Date.now()}`).toString('base64')

    return response.ok({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    })
  }
}
