'use strict'
const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.tocken_created_at = new Date()

      await user.save()

      await Mail.send(['emails.forgotPassword'],
        {
          name: user.username,
          email,
          token: user.token,
          link: `${request.input('rediect_url')}?token=${user.token}`
        }, message => {
          message.to(user.email)
            .from('taelima1997@gmail.com', 'Natanael | Lima')
            .subject('Recuperação de senha')
        })
    } catch (err) {
      return response.status(err.status).send({
        error: {
          message: 'Algo não deu certo, esse e-mail existe?'
        }
      })
    }
  }
}

module.exports = ForgotPasswordController
