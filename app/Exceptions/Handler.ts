import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * Self handle or pass to custom handler
     */
    if (error.code === 'E_VALIDATION_FAILURE' || error.name === 'ValidationError') {
      return ctx.response.badRequest({
        success: false,
        message: 'Erro de validação',
        errors: error.messages || error.errors || error.message,
      })
    }

    if (error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response.notFound({
        success: false,
        message: 'Registro não encontrado',
      })
    }

    return ctx.response.status(error.status || 500).send({
      success: false,
      message: error.message || 'Erro interno do servidor',
    })
  }
}
