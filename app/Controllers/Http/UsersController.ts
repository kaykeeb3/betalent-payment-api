import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { userValidator } from 'App/Validators/UserValidator'

export default class UsersController {
  public async index({ response }: HttpContextContract) {
    const users = await User.all()
    return response.ok({
      success: true,
      data: users,
    })
  }

  public async store({ request, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem criar usuários',
      })
    }
    const payload = await userValidator.validate(request.all())
    const user = await User.create(payload)
    return response.created({
      success: true,
      data: user,
    })
  }

  public async show({ params, response }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    return response.ok({
      success: true,
      data: user,
    })
  }

  public async update({ params, request, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem atualizar usuários',
      })
    }
    const userToUpdate = await User.findOrFail(params.id)
    const payload = await userValidator.validate(request.all())
    userToUpdate.merge(payload)
    await userToUpdate.save()
    return response.ok({
      success: true,
      data: userToUpdate,
    })
  }

  public async destroy({ params, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem excluir usuários',
      })
    }
    const userToDelete = await User.findOrFail(params.id)
    await userToDelete.delete()
    return response.ok({
      success: true,
      message: 'Usuário excluído com sucesso',
    })
  }
}
