import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
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

    // ER_DUP_ENTRY é o código MySQL para constraint única violada
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return ctx.response.conflict({
        success: false,
        message: 'Já existe um registro com estes dados',
      })
    }

    return ctx.response.status(error.status || 500).send({
      success: false,
      message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
    })
  }
}
