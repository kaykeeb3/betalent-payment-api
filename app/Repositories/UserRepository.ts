import User from 'App/Models/User'

export default class UserRepository {
  public async findById(id: number) {
    return await User.find(id)
  }

  public async findByEmail(email: string) {
    return await User.query().where('email', email).first()
  }

  public async create(data: any) {
    return await User.create(data)
  }

  public async update(id: number, data: any) {
    const user = await User.findOrFail(id)
    user.merge(data)
    await user.save()
    return user
  }

  public async delete(id: number) {
    const user = await User.findOrFail(id)
    await user.delete()
  }

  public async list() {
    return await User.all()
  }
}
