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
    const client = await Client.query()
      .where('id', params.id)
      .preload('transactions', (query) => {
        query.preload('gateway').preload('products')
      })
      .firstOrFail()

    return response.ok({
      success: true,
      data: client,
    })
  }
}
