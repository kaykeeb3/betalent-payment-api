import Gateway from 'App/Models/Gateway'

export default class GatewayController {
  public async activate({ params, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem ativar gateways',
      })
    }
    const gateway = await Gateway.findOrFail(params.id)
    gateway.isActive = true
    await gateway.save()

    return response.ok({
      success: true,
      data: gateway,
    })
  }

  public async deactivate({ params, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem desativar gateways',
      })
    }
    const gateway = await Gateway.findOrFail(params.id)
    gateway.isActive = false
    await gateway.save()

    return response.ok({
      success: true,
      data: gateway,
    })
  }

  public async priority({ params, request, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem alterar a prioridade de gateways',
      })
    }
    const gateway = await Gateway.findOrFail(params.id)
    gateway.priority = request.input('priority')
    await gateway.save()

    return response.ok({
      success: true,
      data: gateway,
    })
  }
}
