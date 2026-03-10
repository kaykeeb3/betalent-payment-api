import GatewayRepository from 'App/Repositories/GatewayRepository'
import GatewayInterface, { TransactionRequest, TransactionResponse } from 'App/Gateways/GatewayInterface'
import Gateway1Service from 'App/Gateways/Gateway1Service'
import Gateway2Service from 'App/Gateways/Gateway2Service'

export default class GatewayManagerService {
  private gatewayRepository = new GatewayRepository()

  private adapters: Record<string, GatewayInterface> = {
    'Gateway 1': new Gateway1Service(),
    'Gateway 2': new Gateway2Service(),
  }

  public async executeWithFallback(data: TransactionRequest): Promise<{
    response: TransactionResponse,
    gateway: any
  }> {
    const activeGateways = await this.gatewayRepository.listActiveByPriority()

    if (activeGateways.length === 0) {
      throw new Error('Nenhum gateway de pagamento ativo disponível')
    }

    let lastError = ''

    for (const gateway of activeGateways) {
      const adapter = this.adapters[gateway.name]
      if (!adapter) continue

      const result = await adapter.createTransaction(data)

      if (result.success) {
        return { response: result, gateway }
      }

      lastError = result.errorMessage || 'Erro desconhecido no gateway'
    }

    throw new Error(`Todos os gateways de pagamento falharam: ${lastError}`)
  }

  public async refund(gatewayName: string, externalId: string): Promise<TransactionResponse> {
    const adapter = this.adapters[gatewayName]
    if (!adapter) {
      throw new Error(`Adaptador não encontrado para o gateway: ${gatewayName}`)
    }

    return adapter.refundTransaction(externalId)
  }
}
