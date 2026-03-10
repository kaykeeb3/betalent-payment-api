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

    let authenticatedUser: { email: string; role: string }

    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const [email, role] = decoded.split(':')

      if (!email || !role) {
        throw new Error('Token malformatado')
      }

      authenticatedUser = { email, role }
    } catch (error) {
      console.error('Erro de Autenticação:', error.message)
      return response.unauthorized({
        success: false,
        message: 'Token de autenticação inválido ou malformatado',
      })
    }

    // Adiciona o usuário ao contexto e prossegue para o próximo middleware/controller
    ctx['authenticatedUser'] = authenticatedUser
    await next()
  }
}
