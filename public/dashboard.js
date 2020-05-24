var reportPath = './data/report.json' // URL path (relative) to the report
var lastRefresh = new Date(0)
var categories = { // setup categories for the services
  'WSD Website': { description: 'Main Website', services: [], OK: 0, Alerts: [], Unknown: 0 },
  'Market Data': { description: 'Market Data', services: [], OK: 0, Alerts: [], Unknown: 0 },
  RegXchange: { description: 'Key Info Doc Process', services: [], OK: 0, Alerts: [], Unknown: 0 },
  TPT: { description: 'TPT System', services: [], OK: 0, Alerts: [], Unknown: 0 },
  Fincap: { description: 'Fincap System', services: [], OK: 0, Alerts: [], Unknown: 0 },
  Services: { description: 'Supporting Services', services: [], OK: 0, Alerts: [], Unknown: 0 }
}

getData()
setInterval(function () {
  getData()
}, 30000) // wait 30 seconds and check for a new service report file

/**
 * Load data from service report file
 *
 */
function getData () {
  Object.keys(categories).forEach(function (key) { // reset the categories contents
    categories[key].services = []
    categories[key].Alerts = []
    categories[key].Unknown = 0
    categories[key].OK = 0
  })
  var request = $.get({
    url: reportPath,
    cache: false,
    complete: function (returndata) {
      var fileDate = new Date(request.getResponseHeader('Last-Modified'))
      console.log(lastRefresh, fileDate)
      var data = {}
      try {
        data = JSON.parse(returndata.responseText)
        if (data && fileDate > lastRefresh) { // if the data is newer than we're displaying, update the dashboard
          lastRefresh = fileDate
          updateDashboard(data)
        }
      } catch (err) {
        console.warn('unable to parse JSON file')
      }
    }
  })
}

/**
 * Build the dashboard content
 *
 * @param {object} data - JSON data loaded from the service report file
 */
function updateDashboard (data) {
  $('#updated').text(data.started_at ? new Date(data.started_at).toLocaleString() : '- unavailable -')
  filterServices(data.service_reports)
  data = null
}

/**
 * Filter the service report to exclude non-production services
 *
 * @param {object} data - service reports data
 */
function filterServices (data) {
  data = data.filter(function (x) { return x.host.name.toLowerCase().indexOf('dev') === -1 })
  data = data.filter(function (x) { return x.host.name.toLowerCase().indexOf('demo') === -1 })
  data = data.filter(function (x) { return x.host.name.toLowerCase().indexOf('uat') === -1 })
  data = data.filter(function (x) { return x.host.name.toLowerCase().indexOf('qa') === -1 })
  data = data.filter(function (x) { return x.host.name.toLowerCase().indexOf('staging') === -1 })
  data = data.filter(function (x) { return x.host.name.toLowerCase().indexOf('test') === -1 })
  listServiceReports(data)
  categoriseServices(data)
  data = null
}

/**
 * Display the main data on the page
 *
 * @param {object} data - service status data
 */
function listServiceReports (data) {
  var ok = data.filter(function (x) { return x.status_text === 'OK' })
  $('#ok').text(ok.length)
  var alertList = data.filter(function (x) { return x.status_text !== 'OK' })
  alertList = alertList.filter(function (x) { return x.status_text !== 'Not Implemented' })
  alertList = alertList.filter(function (x) { return x.status_text !== 'No web hosts registered.' })
  var alerts = '<ul  class="list-group">'
  alerts += alertList.map(function (x) { return '<li class="list-group-item">' + x.host.name + ' - ' + normaliseStatus(x.status_text) + '</li>' }).join('')
  alerts += '</ul>'
  $('#alertList').html(alerts)
  $('#alertCount').text(alertList.length)
  var notImplemented = data.length - ok.length - alertList.length
  $('#notImplemented').text(notImplemented)
  data = null
}

/**
 * Split the services into categories
 *
 * @param {object} data - service data
 */
function categoriseServices (data) {
  for (var i = 0; i < data.length; i++) {
    var serviceName = data[i].host.name.toLowerCase()
    if (serviceName.indexOf('wsd website') > -1) {
      categorise(data[i], 'WSD Website')
      continue
    }
    if (serviceName.indexOf('market data') > -1) {
      categorise(data[i], 'Market Data')
      continue
    }
    if (serviceName.indexOf('regx') > -1) {
      categorise(data[i], 'RegXchange')
      continue
    }
    if (serviceName.indexOf('tpt') > -1) {
      categorise(data[i], 'TPT')
      continue
    }
    if (serviceName.indexOf('fincap') > -1) {
      categorise(data[i], 'Fincap')
      continue
    }
    categorise(data[i], 'Services')
  }
  var cards = ''
  Object.keys(categories).forEach(function (key) {
    cards += buildCard(key, categories[key])
  })
  $('#statusSummary').html(cards)
  $('#statusDetails').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var modal = $(this)
    modal.find('.modal-title').text('Status Details: ' + button.data('title'))
    modal.find('#serviceList').html(button.data('services'))
    modal.find('li').addClass('list-group-item')
  })
}

/**
 * Builds the html for displaying the main service overview panels
 *
 * @param {string} title - Category title
 * @param {string} subtitle - Simple description of the category
 * @param {string} status - String representing number of confirmed running services / total number of services for that category
 * @param {string} description - The number of alerts and unknowns for that category
 * @returns
 */
function buildCard (title, category) {
  var servicesDetail = category.services.map(function (x) { return '<li>' + x.host.name + ' - ' + normaliseStatus(x.status_text) + '</li>' }).join('')
  var html = '<div class="col-sm-4"><div class="card"><div class="card-body">'
  html += '<h5 class="card-title">' + title + '</h5>'
  html += '<h2 class="card-title '
  category.Alerts.length > 0 ? html += 'text-danger' : html += 'text-success'
  html += '"> ' + (category.OK + category.Unknown) + '/' + category.services.length + '</></h2>'
  html += '<h6 class="card-subtitle mb-2 text-muted">' + category.description + '</h6>'
  html += '<p class="card-text align-bottom">' + 'Alerts: ' + category.Alerts.length + '. Unknown status: ' + category.Unknown + '</p></div>'
  html += '<div class="card-footer">'
  html += '<button type="button" class="btn btn-primary" data-toggle="modal" data-title="' + title + '" data-services="' + servicesDetail + '" data-target="#statusDetails">'
  html += 'Details</button></div>'
  html += '</div></div>'
  return html
}

/**
 * Add a service to the correct category of services and update category status and alert counts
 *
 * @param {object} service - the service object
 * @param {string} category - category to assign this service to
 */
function categorise (service, category) {
  categories[category].services.push(service)
  var status = service.status_text
  switch (status) {
    case 'OK':
      categories[category].OK++
      break
    case 'Not Implemented':
      categories[category].Unknown++
      break
    case 'No web hosts registered.':
      categories[category].Unknown++
      break
    default:
      categories[category].Alerts.push(service.host.name + ' - ' + normaliseStatus(status))
  }
}

/**
 * returns friendly description for alert status
 *
 * @param {string} status
 */
function normaliseStatus (status) {
  if (status.indexOf('ECONNREFUSED') > -1) return 'Service unavailable'
  if (status.indexOf('invalid json') > -1) return 'Service available. Invalid response'
  if (status.indexOf('Not Implemente') > -1) return 'Service available. Status unknown'
  if (status.indexOf('No web hosts') > -1) return 'Service available. Status unknown'
  if (status.indexOf('One or more nodes') > -1) return 'Service available. Partial failure'
  return status
}
