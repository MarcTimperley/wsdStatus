const superagent = require('superagent')
const getJobId = (reportStatus) => { // pass the authorisation details
  superagent
    .post('https://staging-gateway.priipcloud.com/api/v2.0/gateway/reports/status/service')
    .set('Authorization', `Bearer ${reportStatus.token}`)
    .set('accept', 'json')
    .end((err, res) => {
      if (err) {
        console.error(err)
        return err
      } else {
        console.log('got jobId response')
        console.log(res.body)
        return res.body
      }
    })
}
module.exports = getJobId
