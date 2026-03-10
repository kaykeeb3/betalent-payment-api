import { test } from '@japa/runner'
import Product from 'App/Models/Product'

test.group('Pagamentos e Compras', () => {
  test('deve realizar login e retornar um token válido', async ({ client, assert }) => {
    const response = await client.post('/login').json({
      email: 'admin@email.com',
      password: 'Admin@2024!',
    })

    response.assertStatus(200)
    assert.properties(response.body().data, ['token', 'user'])
    assert.equal(response.body().success, true)
  })

  test('deve realizar uma compra com sucesso (calculando valor no backend)', async ({
    client,
    assert,
  }) => {
    // Busca um produto seedado (assumindo que o MainSeeder rodou)
    const product = await Product.first()
    if (!product) return

    const response = await client.post('/purchase').json({
      client: {
        name: 'Tester User',
        email: 'tester@example.com',
      },
      products: [{ product_id: product.id, quantity: 2 }],
      card: {
        number: '1234123412341234',
        cvv: '123',
      },
    })

    response.assertStatus(201)
    assert.equal(response.body().success, true)
    assert.equal(response.body().data.amount, product.amount * 2)
    assert.equal(response.body().data.status, 'paid')
  })

  test('deve falhar ao acessar rota protegida sem token', async ({ client }) => {
    const response = await client.get('/clients')
    response.assertStatus(401)
    response.assertBodyContains({
      success: false,
      message: 'Token de autenticação não fornecido ou inválido',
    })
  })

  test('deve permitir acesso a rota protegida com token de admin', async ({ client }) => {
    const loginResponse = await client.post('/login').json({
      email: 'admin@email.com',
      password: 'Admin@2024!',
    })
    const token = loginResponse.body().data.token

    const response = await client.get('/clients').header('Authorization', `Bearer ${token}`)
    response.assertStatus(200)
    response.assertBodyContains({ success: true })
  })
})
