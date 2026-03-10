import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Product from 'App/Models/Product'

export default class ProductSeeder extends BaseSeeder {
  public async run() {
    await Product.firstOrCreate(
      { name: 'Camiseta BeTalent' },
      {
        amount: 8990, // R$ 89,90 em centavos
      }
    )

    await Product.firstOrCreate(
      { name: 'Caneca Dev' },
      {
        amount: 4500, // R$ 45,00 em centavos
      }
    )

    console.log('Produtos seedados com sucesso')
  }
}
