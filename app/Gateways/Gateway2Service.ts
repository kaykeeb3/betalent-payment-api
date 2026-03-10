import axios from 'axios'
import GatewayInterface, { TransactionRequest, TransactionResponse } from './GatewayInterface'

export default class Gateway2Service implements GatewayInterface {
  private baseUrl = process.env.GATEWAY_2_URL || 'http://gateways:3002'
  private apiToken = process.env.GATEWAY_2_TOKEN || 'tk_f2198cc671b5289fa856'
  private apiSecret = process.env.GATEWAY_2_SECRET || '3d15e8ed6131446ea7e3456728b1211f'

  public async createTransaction(data: TransactionRequest): Promise<TransactionResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transacoes`,
        {
          valor: data.amount, // Gateway 2 espera 'valor'
          nome: data.clientData.name, // Gateway 2 espera 'nome'
          email: data.clientData.email,
          numeroCartao: data.cardData.number, // Gateway 2 espera 'numeroCartao'
          cvv: data.cardData.cvv,
        },
        {
          headers: {
            'Gateway-Auth-Token': this.apiToken,
            'Gateway-Auth-Secret': this.apiSecret,
          },
        }
      )

      return {
        success: true,
        externalId: response.data.id,
        status: 'paid',
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error.response?.data?.error || 'Erro de comunicação com o provedor de pagamento',
        status: 'failed',
      }
    }
  }

  public async refundTransaction(externalId: string): Promise<TransactionResponse> {
    try {
      await axios.post(
        `${this.baseUrl}/transacoes/reembolso`,
        { id: externalId },
        {
          headers: {
            'Gateway-Auth-Token': this.apiToken,
            'Gateway-Auth-Secret': this.apiSecret,
          },
        }
      )

      return {
        success: true,
        status: 'refunded',
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error.response?.data?.error || 'Erro de comunicação com o provedor de pagamento',
        status: 'failed',
      }
    }
  }
}
