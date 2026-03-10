/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

// Públicas
Route.post('/login', 'AuthController.login')
Route.post('/purchase', 'PurchaseController.store')

// Privadas (Need Auth)
Route.group(() => {
  // Gateways
  Route.patch('/gateways/:id/activate', 'GatewayController.activate')
  Route.patch('/gateways/:id/deactivate', 'GatewayController.deactivate')
  Route.patch('/gateways/:id/priority', 'GatewayController.priority')

  // Users
  Route.resource('/users', 'UsersController').apiOnly()

  // Products
  Route.resource('/products', 'ProductsController').apiOnly()

  // Clients
  Route.get('/clients', 'ClientsController.index')
  Route.get('/clients/:id', 'ClientsController.show')

  // Transactions
  Route.get('/transactions', 'TransactionsController.index')
  Route.get('/transactions/:id', 'TransactionsController.show')

  // Refund
  Route.post('/transactions/:id/refund', 'TransactionsController.refund')
}).middleware('simpleAuth')
