//config/email.js

module.exports.email = {
  service: "Gmail",
  auth: {
    user: 'ravi_sipl@systematixindia.com',
    pass: 'target@2015'
  },
  templateDir: "views/email-template",
  from: 'ravi_sipl@systematixindia.com',
  testMode: false,
  ssl: true
}
