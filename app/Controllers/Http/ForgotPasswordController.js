'use strict'

const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')
const moment = use('moment')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.tocken_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgotPassword'],
        {
          name: user.username,
          email,
          token: user.token,
          link: `${request.input('rediect_url')}?token=${user.token}`
        },
        (message) => {
          message
            .to(user.email)
            .from('taelima1997@gmail.com', 'Natanael | Lima')
            .subject('Recuperação de senha')
        }
      )
    } catch (err) {
      return response.status(err.status).send({
        error: {
          message: 'Algo não deu certo, esse e-mail existe?'
        }
      })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)

      const tokenExpired = moment()
        .subtract('2', 'days')
        .isAfter(user.token_created_at)

      if (tokenExpired) {
        return response.status(401).send({
          error: {
            message: 'O token de recuperação esta expirado'
          }
        })
      }

      user.token = null
      user.tocken_created_at = null
      user.password = password

      await user.save()
    } catch (err) {
      return response.status(err.status).send({
        error: {
          message: 'Algo deu errado ao resetar sua senha'
        }
      })
    }
  }
}

module.exports = ForgotPasswordController
