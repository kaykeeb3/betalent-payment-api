import axios from 'axios'
import GatewayInterface, { TransactionRequest, TransactionResponse } from './GatewayInterface'

export default class Gateway1Service implements GatewayInterface {
  private baseUrl = process.env.GATEWAY_1_URL || 'http://gateways:3001'
  private email = process.env.GATEWAY_1_EMAIL || 'dev@betalent.tech'
  private tokenSeed = process.env.GATEWAY_1_TOKEN || 'FEC9BB078BF338F464F96B48089EB498'

  private async getAuthToken() {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, {
        email: this.email,
        token: this.tokenSeed,
      })
      return response.data.token
    } catch (error) {
      console.error('Erro de Login no Gateway1:', error.response?.data || error.message)
      throw new Error('Não foi possível autenticar com o Gateway 1')
    }
  }

  public async createTransaction(data: TransactionRequest): Promise<TransactionResponse> {
    try {
      const token = await this.getAuthToken()
      const response = await axios.post(
        `${this.baseUrl}/transactions`,
        {
          amount: data.amount, // Gateway 1 espera 'amount'
          name: data.clientData.name, // Gateway 1 espera 'name'
          email: data.clientData.email,
          cardNumber: data.cardData.number, // Gateway 1 espera 'cardNumber'
          cvv: data.cardData.cvv,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
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
      const token = await this.getAuthToken()
      await axios.post(
        `${this.baseUrl}/transactions/${externalId}/charge_back`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
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
