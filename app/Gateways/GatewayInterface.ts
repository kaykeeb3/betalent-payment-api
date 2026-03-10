export interface TransactionRequest {
  amount: number
  clientData: {
    name: string
    email: string
  }
  cardData: {
    number: string
    holder: string
    cvv: string
    expiry: string
  }
}

export interface TransactionResponse {
  success: boolean
  externalId?: string
  errorMessage?: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
}

export default interface GatewayInterface {
  createTransaction(data: TransactionRequest): Promise<TransactionResponse>
  refundTransaction(externalId: string): Promise<TransactionResponse>
}
