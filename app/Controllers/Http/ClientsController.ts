import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'

export default class ClientsController {
  public async index({ response }: HttpContextContract) {
    const clients = await Client.all()
    return response.ok({
      success: true,
      data: clients,
    })
  }

  public async show({ params, response }: HttpContextContract) {
    const client = await Client.findOrFail(params.id)
    return response.ok({
      success: true,
      data: client,
    })
  }
}
