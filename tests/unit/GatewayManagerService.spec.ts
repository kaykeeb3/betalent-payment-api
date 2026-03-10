import { test } from '@japa/runner'
import sinon from 'sinon'
import GatewayManagerService from 'App/Services/GatewayManagerService'
import GatewayRepository from 'App/Repositories/GatewayRepository'
import Gateway1Service from 'App/Gateways/Gateway1Service'
import Gateway2Service from 'App/Gateways/Gateway2Service'

test.group('GatewayManagerService', (group) => {
  group.each.teardown(() => {
    sinon.restore()
  })

  test('deve executar o fallback quando o primeiro gateway falha', async ({ assert }) => {
    const gatewaysMock = [
      { id: 1, name: 'Gateway 1', priority: 1 },
      { id: 2, name: 'Gateway 2', priority: 2 },
    ]
    sinon.stub(GatewayRepository.prototype, 'listActiveByPriority').resolves(gatewaysMock as any)

    const g1Stub = sinon.stub(Gateway1Service.prototype, 'createTransaction').resolves({
      success: false,
      errorMessage: 'Erro no Gateway 1',
      status: 'failed',
    })

    const g2Stub = sinon.stub(Gateway2Service.prototype, 'createTransaction').resolves({
      success: true,
      externalId: 'ext_123',
      status: 'paid',
    })

    const service = new GatewayManagerService()
    const result = await service.executeWithFallback({
      amount: 100,
      clientData: { name: 'João', email: 'joao@email.com' },
      cardData: { number: '1234', holder: 'João', cvv: '123', expiry: '12/28' },
    })

    assert.isTrue(g1Stub.calledOnce)
    assert.isTrue(g2Stub.calledOnce)
    assert.equal(result.response.externalId, 'ext_123')
    assert.equal(result.gateway.name, 'Gateway 2')
  })

  test('deve parar no primeiro gateway se este tiver sucesso', async ({ assert }) => {
    const gatewaysMock = [
      { id: 1, name: 'Gateway 1', priority: 1 },
      { id: 2, name: 'Gateway 2', priority: 2 },
    ]
    sinon.stub(GatewayRepository.prototype, 'listActiveByPriority').resolves(gatewaysMock as any)

    const g1Stub = sinon.stub(Gateway1Service.prototype, 'createTransaction').resolves({
      success: true,
      externalId: 'ext_g1',
      status: 'paid',
    })

    const g2Stub = sinon.stub(Gateway2Service.prototype, 'createTransaction')

    const service = new GatewayManagerService()
    await service.executeWithFallback({
      amount: 100,
      clientData: { name: 'João', email: 'joao@email.com' },
      cardData: { number: '1234', holder: 'João', cvv: '123', expiry: '12/28' },
    })

    assert.isTrue(g1Stub.calledOnce)
    assert.isTrue(g2Stub.notCalled)
  })

  test('deve lançar erro se todos os gateways falharem', async ({ assert }) => {
    const gatewaysMock = [{ id: 1, name: 'Gateway 1', priority: 1 }]
    sinon.stub(GatewayRepository.prototype, 'listActiveByPriority').resolves(gatewaysMock as any)

    sinon.stub(Gateway1Service.prototype, 'createTransaction').resolves({
      success: false,
      errorMessage: 'Falha crítica',
      status: 'failed',
    })

    const service = new GatewayManagerService()

    await assert.rejects(async () => {
      await service.executeWithFallback({} as any)
    }, /Todos os gateways de pagamento falharam: Falha crítica/)
  })
})
