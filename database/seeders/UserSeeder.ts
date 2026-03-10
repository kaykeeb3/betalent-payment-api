import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.updateOrCreate(
      { email: 'admin@email.com' },
      {
        password: 'Admin@2024!',
        role: 'admin',
      }
    )

    console.log('Usuário administrador configurado com sucesso')
  }
}
