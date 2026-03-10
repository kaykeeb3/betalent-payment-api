import Transaction from 'App/Models/Transaction'

export default class TransactionRepository {
  public async create(data: any, trx?: any) {
    const transaction = new Transaction()
    if (trx) transaction.useTransaction(trx)

    transaction.clientId = data.clientId
    transaction.amount = data.amount
    transaction.status = data.status || 'pending'
    transaction.cardLastNumbers = data.cardLastNumbers

    await transaction.save()
    return transaction
  }

  public async updateStatus(
    id: number,
    status: string,
    gatewayData?: { gatewayId?: number; externalId?: string | null },
    trx?: any
  ) {
    const query = trx ? Transaction.query().useTransaction(trx) : Transaction.query()
    const transaction = await query.where('id', id).firstOrFail()
    transaction.status = status

    if (gatewayData) {
      if (gatewayData.gatewayId) transaction.gatewayId = gatewayData.gatewayId
      if (gatewayData.externalId !== undefined) transaction.externalId = gatewayData.externalId
    }

    await transaction.save()
    return transaction
  }

  public async findById(id: number, trx?: any) {
    const query = trx ? Transaction.query().useTransaction(trx) : Transaction.query()
    return await query
      .where('id', id)
      .preload('client')
      .preload('gateway')
      .preload('products')
      .first()
  }

  public async findByIdOrFail(id: number, trx?: any) {
    const query = trx ? Transaction.query().useTransaction(trx) : Transaction.query()
    return await query
      .where('id', id)
      .preload('client')
      .preload('gateway')
      .preload('products')
      .firstOrFail()
  }

  public async list() {
    return await Transaction.query()
      .preload('client')
      .preload('gateway')
      .orderBy('createdAt', 'desc')
  }
}
