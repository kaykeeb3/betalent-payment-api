import Product from 'App/Models/Product'

export default class ProductRepository {
  public async findById(id: number) {
    return await Product.find(id)
  }

  public async findByIdOrFail(id: number) {
    return await Product.findOrFail(id)
  }

  public async create(data: any) {
    return await Product.create(data)
  }

  public async update(id: number, data: any) {
    const product = await Product.findOrFail(id)
    product.merge(data)
    await product.save()
    return product
  }

  public async delete(id: number) {
    const product = await Product.findOrFail(id)
    await product.delete()
  }

  public async list() {
    return await Product.all()
  }
}
