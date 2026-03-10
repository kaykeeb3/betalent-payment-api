import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import UserValidator from 'App/Validators/UserValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'

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

    const payload = await request.validate(UserValidator)

    try {
      const createdUser = await User.create(payload)
      return response.created({
        success: true,
        data: createdUser,
      })
    } catch (dbError) {
      // ER_DUP_ENTRY é o código MySQL para constraint única violada
      if (dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062) {
        return response.conflict({
          success: false,
          message: 'Já existe um usuário cadastrado com este e-mail',
        })
      }
      throw dbError
    }
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
    const payload = await request.validate(UpdateUserValidator)

    try {
      userToUpdate.merge(payload)
      await userToUpdate.save()
      return response.ok({
        success: true,
        data: userToUpdate,
      })
    } catch (dbError) {
      if (dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062) {
        return response.conflict({
          success: false,
          message: 'Já existe um usuário cadastrado com este e-mail',
        })
      }
      throw dbError
    }
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
