import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SimpleAuthMiddleware {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const { request, response } = ctx
    const authHeader = request.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.unauthorized({
        success: false,
        message: 'Token de autenticação não fornecido ou inválido',
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return response.unauthorized({
        success: false,
        message: 'Token inválido',
      })
    }

    try {
      const decoded = Buffer.from(token, 'base64').toString('ascii')
      const [email, role] = decoded.split(':')

      if (!email || !role) {
        throw new Error('Token malformatado')
      }

      // Usando authenticatedUser para evitar conflito com variáveis locais 'user'
      ctx['authenticatedUser'] = { email, role }

      await next()
    } catch (error) {
      return response.unauthorized({
        success: false,
        message: 'Token de autenticação inválido ou expirado',
      })
    }
  }
}
