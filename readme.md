[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
# WSD Status Dashboard

The dashboard shows an overview of the status of the WSD services. It is a non-technical view of the services and is constrained to a display of the production services.

## Running the dashboard

 - setup the environment variables (see below)
 - run `npm install` to install all dependencies
 - run `npm start` or `node server` at the project root (depending on preference)
 - navigate to http://localhost:3000 unless an alternative port is specified in the environment variables  

## Environment Variables

#### Mandatory

- GRANT_TYPE - authentication grant type
- CLIENT_ID - authentication user ID
- CLIENT_SECRET - authentication secret

#### Optional

- PORT (default: 3000) - server listening port
- REPORTPATH (default: /public/data) - if this is changed from the default, /public/dashboard.js must be updated too.
- INTERVAL (default: 300) - time in seconds to refresh status data

## Prerequisites

- node 6.5 +
- npm 3.10.x +

## Contributing and Code of Conduct

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the code of conduct, and the process for submitting pull requests.

## Authors

* **Marc Timperley** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details



## TODO

- [ ] Add link to alerts badge
- [x] Drilldown for each service (modal?)
- [ ] Improve CSS and sass
- [ ] Admin view (all services)?
- [X] All documentation
- [ ] Build test cases
- [ ] Move categorisation of services to separate config file