import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Product from 'App/Models/Product'
import { productValidator } from 'App/Validators/ProductValidator'

export default class ProductsController {
  public async index({ response }: HttpContextContract) {
    const products = await Product.all()
    return response.ok({
      success: true,
      data: products,
    })
  }

  public async store({ request, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem criar produtos',
      })
    }
    const payload = await productValidator.validate(request.all())
    const product = await Product.create(payload)
    return response.created({
      success: true,
      data: product,
    })
  }

  public async show({ params, response }: HttpContextContract) {
    const product = await Product.findOrFail(params.id)
    return response.ok({
      success: true,
      data: product,
    })
  }

  public async update({ params, request, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem atualizar produtos',
      })
    }
    const product = await Product.findOrFail(params.id)
    const payload = await productValidator.validate(request.all())
    product.merge(payload)
    await product.save()
    return response.ok({
      success: true,
      data: product,
    })
  }

  public async destroy({ params, response, authenticatedUser }: any) {
    if (authenticatedUser?.role !== 'admin') {
      return response.forbidden({
        success: false,
        message: 'Acesso negado: apenas administradores podem excluir produtos',
      })
    }
    const product = await Product.findOrFail(params.id)
    await product.delete()
    return response.ok({
      success: true,
      message: 'Produto excluído com sucesso',
    })
  }
}
