import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PaymentService from 'App/Services/PaymentService'
import PurchaseValidator from 'App/Validators/PurchaseValidator'

export default class PurchaseController {
  private paymentService = new PaymentService()

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(PurchaseValidator)

    try {
      const transaction = await this.paymentService.processPurchase(payload)
      return response.created({
        success: true,
        data: transaction,
      })
    } catch (error) {
      console.error('Erro na Compra:', error)
      return response.badRequest({
        success: false,
        message: error.message,
      })
    }
  }
}
