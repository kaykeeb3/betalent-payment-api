import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, BelongsTo, manyToMany, ManyToMany, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import Gateway from './Gateway'
import Product from './Product'
import TransactionProduct from './TransactionProduct'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'client_id' })
  public clientId: number

  @column({ columnName: 'gateway_id' })
  public gatewayId: number | null

  @column({ columnName: 'external_id' })
  public externalId: string | null

  @column()
  public status: string

  @column()
  public amount: number

  @column({ columnName: 'card_last_numbers' })
  public cardLastNumbers: string | null

  @belongsTo(() => Client)
  public client: BelongsTo<typeof Client>

  @belongsTo(() => Gateway)
  public gateway: BelongsTo<typeof Gateway>

  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
    pivotForeignKey: 'transaction_id',
    pivotRelatedForeignKey: 'product_id',
    pivotColumns: ['quantity']
  })
  public products: ManyToMany<typeof Product>

  @hasMany(() => TransactionProduct)
  public transactionProducts: HasMany<typeof TransactionProduct>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  public updatedAt: DateTime
}
