import Gateway from 'App/Models/Gateway'

export default class GatewayRepository {
  public async listActiveByPriority() {
    return await Gateway.query()
      .where('isActive', true)
      .orderBy('priority', 'asc')
  }

  public async findByName(name: string) {
    return await Gateway.query().where('name', name).first()
  }

  public async findById(id: number) {
    return await Gateway.find(id)
  }

  public async toggleActive(id: number, status: boolean) {
    const gateway = await Gateway.findOrFail(id)
    gateway.isActive = status
    await gateway.save()
    return gateway
  }

  public async updatePriority(id: number, priority: number) {
    const gateway = await Gateway.findOrFail(id)
    gateway.priority = priority
    await gateway.save()
    return gateway
  }
}
