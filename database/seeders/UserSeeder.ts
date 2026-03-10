import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.firstOrCreate(
      { email: 'admin@email.com' },
      {
        password: await Hash.make('123456'),
        role: 'admin',
      }
    )

    console.log('Usuário administrador configurado com sucesso');
  }
}
