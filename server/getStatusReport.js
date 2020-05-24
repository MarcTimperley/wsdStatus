/**
 * get the status report in three stages
 * @module getStatusReport
 */
const superagent = require('superagent') // using superagent for compatibility with node 6.5
const path = require('path')
const fs = require('fs')
require('dotenv').config(path.join(__dirname, '.env'))
const reportPath = process.env.REPORTPATH || '../public/data/report.json' // path to save the status report

const getStatusReport = () => {
  console.info(`getting status report at ${new Date().toLocaleTimeString()}`)
  const params = { // get all authorisation details from environment variables (.env config file in this instance)
    grant_type: process.env.GRANT_TYPE,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
  }
  getAuthToken(params)
}

/**
 * get authorisation token
 * @param {object} params - parameters to send to the oauth service
 */
const getAuthToken = (params) => {
  superagent
    .post('https://staging-authentication.wallstreetdocs.com/oauth/token')
    .send(params)
    .set('accept', 'json')
    .then((res) => {
      console.log('  got token response')
      if (res.body.access_token) getJobId(res.body.access_token)
    })
    .catch((err) => {
      console.error(err)
    })
}
/**
 * get job id for the report request
 * @param {string} token - response body from auth token service
 */
const getJobId = (token) => {
  superagent
    .post('https://staging-gateway.priipcloud.com/api/v2.0/gateway/reports/status/service')
    .set('Authorization', `Bearer ${token}`)
    .set('accept', 'json')
    .then((res) => {
      console.log('  got jobId response')
      getReport(token, res.body.job_id)
    })
    .catch((err) => {
      console.error(err)
    })
}

/**
 * get the status report job
 * @param {string} token - OAuth access token
 * @param {string} jobId - job id from report request service
 */
const getReport = (token, jobId) => {
  setTimeout(() => {
    superagent
      .get(`https://staging-gateway.priipcloud.com/api/v2.0/gateway/reports/status/service/${jobId}`)
      .retry(5)
      .set('Authorization', `Bearer ${token}`)
      .set('accept', 'json')
      .then((res) => {
        fs.writeFileSync(path.join(__dirname, '..', reportPath, 'report.json'), JSON.stringify(res.body, null, 4), 'utf8') // cache report to file - stringify for readibility
        console.log(`saved report at ${path.join(__dirname, '..', reportPath, 'report.json')}`)
      })
      .catch((err) => {
        console.error(err)
      })
  }, 1e4) // wait 10 seconds before trying to get report. Better option is to use something that repects 502 as retry error, like 'got'
}

module.exports = getStatusReport
