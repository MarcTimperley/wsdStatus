const superagent = require('superagent')
const path = require('path')
require('dotenv').config(path.join(__dirname, '.env'))
const getAccessToken = () => {
  const params = { // get all authorisation details from environment variables (.env config file in this instance)
    grant_type: process.env.GRANT_TYPE,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
  }

  superagent
    .post('https://staging-authentication.wallstreetdocs.com/oauth/token')
    .send(params)
    .set('accept', 'json')
    .end((err, res) => {
      if (err) {
        console.error(err)
        return err
      } else {
        console.log('got token response')
        console.log(res.body)
        return res.body
      }
    })
}
module.exports = getAccessToken
