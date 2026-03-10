import Database from '@ioc:Adonis/Lucid/Database'
import ProductRepository from 'App/Repositories/ProductRepository'
import ClientRepository from 'App/Repositories/ClientRepository'
import TransactionRepository from 'App/Repositories/TransactionRepository'
import GatewayManagerService from './GatewayManagerService'
import { TransactionRequest } from 'App/Gateways/GatewayInterface'

export default class PaymentService {
  private gatewayManager = new GatewayManagerService()
  private productRepository = new ProductRepository()
  private clientRepository = new ClientRepository()
  private transactionRepository = new TransactionRepository()

  public async processPurchase(payload: {
    client: { name: string; email: string }
    products: { product_id: number; quantity: number }[]
    card: { number: string; cvv: string }
  }) {
    // 1. Fase de Persistência Inicial (Atômica)
    const { transactionId, totalAmount } = await Database.transaction(async (trx) => {
      let currentTotal = 0
      const productsData: { productId: number; quantity: number; amount: number }[] = []

      // Válida produtos e calcula total
      for (const item of payload.products) {
        const product = await this.productRepository.findByIdOrFail(item.product_id)
        currentTotal += product.amount * item.quantity
        productsData.push({
          productId: product.id,
          quantity: item.quantity,
          amount: product.amount,
        })
      }

      const client = await this.clientRepository.firstOrCreate(
        payload.client.email,
        payload.client.name,
        trx
      )

      const transaction = await this.transactionRepository.create(
        {
          clientId: client.id,
          amount: currentTotal,
          status: 'pending',
          cardLastNumbers: payload.card.number.slice(-4),
        },
        trx
      )

      for (const item of productsData) {
        await transaction.related('transactionProducts').create({
          productId: item.productId,
          quantity: item.quantity,
        })
      }

      return { transactionId: transaction.id, totalAmount: currentTotal }
    })

    // 2. Fase de Processamento Externo (Fora da Transação de Banco)
    const gatewayRequest: TransactionRequest = {
      amount: totalAmount,
      clientData: payload.client,
      cardData: {
        number: payload.card.number,
        holder: payload.client.name,
        cvv: payload.card.cvv,
        expiry: '12/28',
      },
    }

    try {
      const { response, gateway } = await this.gatewayManager.executeWithFallback(gatewayRequest)

      await this.transactionRepository.updateStatus(transactionId, 'paid', {
        gatewayId: gateway.id,
        externalId: response.externalId || null,
      })
    } catch (error) {
      await this.transactionRepository.updateStatus(transactionId, 'failed')
      throw error
    }

    return await this.transactionRepository.findByIdOrFail(transactionId)
  }

  public async refund(transactionId: number) {
    const transaction = await this.transactionRepository.findByIdOrFail(transactionId)

    if (!transaction.gateway) {
      throw new Error('A transação não possui um gateway associado')
    }

    if (!transaction.externalId) {
      throw new Error('A transação não possui uma referência externa para estorno')
    }

    const result = await this.gatewayManager.refund(
      transaction.gateway.name,
      transaction.externalId
    )

    if (result.success) {
      await this.transactionRepository.updateStatus(transaction.id, 'refunded')
    } else {
      throw new Error(`Falha no estorno: ${result.errorMessage}`)
    }

    return await this.transactionRepository.findByIdOrFail(transaction.id)
  }
}
