import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PaymentService from 'App/Services/PaymentService'
import { purchaseValidator } from 'App/Validators/PurchaseValidator'

export default class PurchaseController {
  private paymentService = new PaymentService()

  public async store({ request, response }: HttpContextContract) {
    const payload = await purchaseValidator.validate(request.all())

    try {
      const transaction = await this.paymentService.processPurchase(payload)
      return response.created({
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
