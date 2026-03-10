import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Transaction from './Transaction'
import Product from './Product'

export default class TransactionProduct extends BaseModel {
  public static table = 'transaction_products'

  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'transaction_id' })
  public transactionId: number

  @column({ columnName: 'product_id' })
  public productId: number

  @column()
  public quantity: number

  @belongsTo(() => Transaction)
  public transaction: BelongsTo<typeof Transaction>

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  public updatedAt: DateTime
}
