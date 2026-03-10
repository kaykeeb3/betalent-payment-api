import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Gateway from 'App/Models/Gateway'

export default class GatewaySeeder extends BaseSeeder {
  public async run() {
    await Gateway.firstOrCreate(
      { name: 'Gateway 1' },
      {
        isActive: true,
        priority: 1,
      }
    )

    await Gateway.firstOrCreate(
      { name: 'Gateway 2' },
      {
        isActive: true,
        priority: 2,
      }
    )

    console.log('Gateways configurados com sucesso');
  }
}
