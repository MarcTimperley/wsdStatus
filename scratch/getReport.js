const superagent = require('superagent')
const path = require('path')
const fs = require('fs')
require('dotenv').config(path.join(__dirname, '.env'))
const reportPath = process.env.REPORTPATH || '../public/data/report.json'// path to save the status report

const getReport = (reportStatus) => {
  superagent
    .get(`https://staging-gateway.priipcloud.com/api/v2.0/gateway/reports/status/service/${reportStatus.jobId}`)
    .set('Authorization', `Bearer ${reportStatus.token}`)
    .set('accept', 'json')
    .end((err, res) => {
      if (err) {
        console.error(err)
        return err
      } else {
        fs.writeFileSync(path.join(__dirname, reportPath), JSON.stringify(JSON.parse(res.body), null, 4), 'utf8') // create report - parse and stringify for readibility
        return `saved report at ${reportPath}`
      }
    })
}

module.exports = getReport
