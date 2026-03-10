import { test } from '@japa/runner'
import sinon from 'sinon'
import PaymentService from 'App/Services/PaymentService'
import ProductRepository from 'App/Repositories/ProductRepository'
import ClientRepository from 'App/Repositories/ClientRepository'
import TransactionRepository from 'App/Repositories/TransactionRepository'
import GatewayManagerService from 'App/Services/GatewayManagerService'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('PaymentService', (group) => {
  group.each.teardown(() => {
    sinon.restore()
  })

  test('deve calcular o valor total corretamente a partir dos produtos', async ({ assert }) => {
    sinon.stub(Database, 'transaction').callsFake(async (callback: any) => {
      return callback({} as any)
    })

    const findProductStub = sinon.stub(ProductRepository.prototype, 'findByIdOrFail')
    findProductStub.withArgs(1).resolves({ id: 1, amount: 1000 } as any)
    findProductStub.withArgs(2).resolves({ id: 2, amount: 2500 } as any)

    sinon.stub(ClientRepository.prototype, 'firstOrCreate').resolves({ id: 10 } as any)

    const createTransactionStub = sinon.stub(TransactionRepository.prototype, 'create').resolves({
      id: 50,
      related: () => ({ create: sinon.stub().resolves() }),
    } as any)

    sinon.stub(GatewayManagerService.prototype, 'executeWithFallback').resolves({
      response: { success: true, externalId: 'ext_999', status: 'paid' },
      gateway: { id: 1, name: 'Gateway 1' },
    })

    sinon.stub(TransactionRepository.prototype, 'updateStatus').resolves()
    sinon.stub(TransactionRepository.prototype, 'findByIdOrFail').resolves({ id: 50 } as any)

    const service = new PaymentService()
    await service.processPurchase({
      client: { name: 'João', email: 'joao@email.com' },
      products: [
        { product_id: 1, quantity: 2 },
        { product_id: 2, quantity: 1 },
      ],
      card: { number: '1234123412346063', cvv: '123' },
    })

    assert.isTrue(createTransactionStub.calledOnce)
    const transactionData = createTransactionStub.firstCall.args[0]
    assert.equal(transactionData.amount, 4500)
  })

  test('deve marcar transação como failed se o gateway falhar', async ({ assert }) => {
    sinon.stub(Database, 'transaction').callsFake(async (callback: any) => callback({} as any))
    sinon
      .stub(ProductRepository.prototype, 'findByIdOrFail')
      .resolves({ id: 1, amount: 100 } as any)
    sinon.stub(ClientRepository.prototype, 'firstOrCreate').resolves({ id: 1 } as any)
    sinon.stub(TransactionRepository.prototype, 'create').resolves({
      id: 1,
      related: () => ({ create: sinon.stub().resolves() }),
    } as any)

    sinon
      .stub(GatewayManagerService.prototype, 'executeWithFallback')
      .rejects(new Error('Gateway Down'))
    const updateStatusStub = sinon.stub(TransactionRepository.prototype, 'updateStatus').resolves()

    const service = new PaymentService()

    await assert.rejects(async () => {
      await service.processPurchase({
        client: { name: 'A', email: 'a@a.com' },
        products: [{ product_id: 1, quantity: 1 }],
        card: { number: '6063', cvv: '123' },
      })
    }, 'Gateway Down')

    assert.isTrue(updateStatusStub.calledWith(1, 'failed'))
  })
})
