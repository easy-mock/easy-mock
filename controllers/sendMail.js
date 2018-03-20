var nodemailer = require('nodemailer')
// var start = Date.now()

var smtpConfig = {
  host: 'smtp.qq.com',
  // 端口号 465 或 587
  port: 465,
  // use SSL
  secure: true,
  auth: {
    user: '376365334@qq.com',
    pass: 'sqwqiezcxtjdbgbb'
  }
}
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(smtpConfig)

// setup e-mail data with unicode symbols
var mailOptions = {
  // sender address
  from: '376365334@qq.com',
  // list of receivers
  to: '376365334@qq.com',
  // Subject line
  subject: '项目更新',
  // plaintext body
  // text: 'Hello world ?',
  // html body
  html: '<h1>项目更新</h1>'
}

// send mail with defined transport object
let sendMail = function (obj, callback) {
  let { to, subject, html } = obj || {}
  mailOptions.to = to || mailOptions.to
  mailOptions.subject = subject || mailOptions.subject
  mailOptions.html = html || mailOptions.html
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      // console.log(obj.to, 'error')
      callback && callback(obj, 'error')
    } else {
      console.log(obj.to, 'success')
      callback && callback(obj, 'success')
    }
  })
}

module.exports = sendMail
