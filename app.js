const express = require('express')
const app = express()
const logger = require('morgan')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

// const Sentry = require('@sentry/node')
const cors = require('cors')

// if(process.env.NODE_ENV === 'production'){
//   Sentry.init({
//     dsn: process.env.SENTRY_DSN,
//     environment: 'production'
//   })
// }
// else if(process.env.NODE_ENV === 'staging'){
//   Sentry.init({
//     dsn: process.env.SENTRY_DSN,
//     environment: 'staging'
//   })
// }
// else {
//   Sentry.init({
//     dsn: process.env.SENTRY_DSN,
//     environment: 'development'
//   })
// }

// The request handler must be the first middleware on the app
// app.use(Sentry.Handlers.requestHandler())

dotenv.config()

app.use(cors())

app.use(logger('dev'))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'Options') {
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE')
    return res.status(200).json({})
  }
  next()
});

const sampleRoutes = require('./api/routes').sampleRoutes

app.set('views', './api/views')
app.use(express.static('./api/views'))
app.set('view engine', 'pug')


// Base routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/', sampleRoutes)


// The error handler must be before any other error middleware
// app.use(Sentry.Handlers.errorHandler());

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') { 
    res.status(401).send('You are not allowed to go here.');
  }
});

// Optional fallthrough error handler
// app.use(function onError(err, req, res, next) {
//   res.statusCode = 500;
//   res.end(res.sentry + '\n');
// });

//If not able to match a URL, go to 404
app.use(function(req, res, next) {
  res.status(404).send('Cannot find what you are looking for!');
});

module.exports = app;
