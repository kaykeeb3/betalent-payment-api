import { DateTime } from 'luxon'
import { column, BaseModel, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Transaction from './Transaction'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public amount: number // Valor em centavos

  @manyToMany(() => Transaction, {
    pivotTable: 'transaction_products',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'transaction_id',
    pivotColumns: ['quantity']
  })
  public transactions: ManyToMany<typeof Transaction>

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  public updatedAt: DateTime
}
