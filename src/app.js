import express from 'express';
import { json, urlencoded } from 'body-parser';
import httpErrors from 'http-errors';
import path from 'path';
import ejs from 'ejs';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { constants } from 'buffer';
import viewRouter from './routes';

const responseUtulity = {
  success: (res, data) => {
    res.status(200).json({
      status: 'success',
      data,
    });
  },
  error: (res, code, msg) => res.status(code).json({
    status: 'error',
    error: msg,
  }),
};


const main = (options, cb) => {
  // Set default options
  const ready = cb || function () {}
  const opts = Object.assign({
    // Default options
  }, options)

  const logger = pino()

  // Server state
  let server
  let serverStarted = false
  let serverClosing = false

  // Setup error handling
  function unhandledError (err) {
    // Log the errors
    logger.error(err)

    // Only clean up once
    if (serverClosing) {
      return
    }
    serverClosing = true

    // If server has started, close it down
    if (serverStarted) {
      server.close(function () {
        process.exit(1)
      })
    }
  }
  process.on('uncaughtException', unhandledError)
  process.on('unhandledRejection', unhandledError)

  // Create the express app
  const app = express()

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });  

  // Template engine
  app.engine('html', ejs.renderFile)
  app.set('views', path.join(__dirname, 'views'))
  app.set('files', path.join(__dirname, 'files'))
  app.set('view engine', 'html')
  app.use(express.static('views'))
  app.use(express.static('files'))
  app.use(express.static(path.join(__dirname, 'files')));

  app.use(viewRouter)

  // Common middleware
  app.use(pinoHttp({ logger }))

  // Register routes
  // @NOTE: require here because this ensures that even syntax errors
  // or other startup related errors are caught logged and debuggable.
  // Alternativly, you could setup external log handling for startup
  // errors and handle them outside the node process.  I find this is
  // better because it works out of the box even in local development.
//  routes(app, opts)
  
  app.use(json());
  app.use(urlencoded({ extended: true }));
  
  app.use('/api/v1', (req, res) => responseUtulity.success(res,'success'));  
  

  // Common error handlers
  app.use(function fourOhFourHandler (req, res, next) {
    next(httpErrors(404, `Route not found: ${req.url}`))
  })
  app.use(function fiveHundredHandler (err, req, res, next) {
    if (err.status >= 500) {
      logger.error(err)
    }
    res.locals.name = 'pafradio'
    res.locals.error = err
    res.status(err.status || 500).render('error')
  })
  
  // Start server
  server = app.listen(opts.port, opts.host, function (err) {
    if (err) {
      return ready(err, app, server)
    }

    // If some other error means we should close
    if (serverClosing) {
      return ready(new Error('Server was closed before it could start'))
    }

    serverStarted = true
    const addr = server.address()
    logger.info(`Started at ${opts.host || addr.host || 'localhost'}:${addr.port}`)
    ready(err, app, server)
  })
}

export default main;

