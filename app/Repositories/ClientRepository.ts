import Client from 'App/Models/Client'

export default class ClientRepository {
  public async firstOrCreate(email: string, name: string, trx?: any) {
    const query = trx ? Client.query().useTransaction(trx) : Client.query()

    let client = await query.where('email', email).first()

    if (!client) {
      client = new Client()
      if (trx) client.useTransaction(trx)
      client.email = email
      client.name = name
      await client.save()
    }

    return client
  }

  public async findById(id: number) {
    return await Client.find(id)
  }

  public async listWithTransactions() {
    return await Client.query()
      .preload('transactions', (query) => {
        query.preload('products')
      })
  }

  public async findByIdWithTransactions(id: number) {
    return await Client.query()
      .where('id', id)
      .preload('transactions', (query) => {
        query.preload('products')
      })
      .first()
  }
}
