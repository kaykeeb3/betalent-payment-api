import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Transaction from 'App/Models/Transaction'
import PaymentService from 'App/Services/PaymentService'

export default class TransactionsController {
  private paymentService = new PaymentService()

  public async index({ response }: HttpContextContract) {
    const transactions = await Transaction.query()
      .preload('client')
      .preload('gateway')
      .preload('products')
      .orderBy('createdAt', 'desc')

    return response.ok({
      success: true,
      data: transactions,
    })
  }

  public async show({ params, response }: HttpContextContract) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('client')
      .preload('gateway')
      .preload('products')
      .firstOrFail()

    return response.ok({
      success: true,
      data: transaction,
    })
  }

  public async refund({ params, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem realizar estornos',
      })
    }
    try {
      const transaction = await this.paymentService.refund(params.id)
      return response.ok({
        success: true,
        data: transaction,
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }
}
