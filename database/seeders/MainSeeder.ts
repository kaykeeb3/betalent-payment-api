import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import GatewaySeeder from './GatewaySeeder'
import UserSeeder from './UserSeeder'

export default class MainSeeder extends BaseSeeder {
  public async run() {
    await new GatewaySeeder(this.client).run()
    await new UserSeeder(this.client).run()
  }
}
