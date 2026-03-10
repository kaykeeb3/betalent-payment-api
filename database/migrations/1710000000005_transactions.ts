import Schema from '@ioc:Adonis/Lucid/Schema'

export default class TransactionsSchema extends Schema {
  protected tableName = 'transactions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('client_id').unsigned().references('id').inTable('clients').onDelete('CASCADE')
      table.integer('gateway_id').unsigned().references('id').inTable('gateways').onDelete('SET NULL')
      table.string('external_id', 255).nullable()
      table.string('status', 50).notNullable()
      table.integer('amount').notNullable()
      table.string('card_last_numbers', 4).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
