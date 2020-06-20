/*
const routes = (app, opts) => {
  // Setup routes, middleware, and handlers
  console.log(opts);
  app.get('/', (req, res) => {
    res.locals.name = 'pafradio'
    res.render('index')
  })  
}

export default routes;
*/

import express from 'express';

const viewRouter = express.Router();

viewRouter.get('/', (req, res) => {
  res.locals.name = 'pafradio'
  res.render('index')
})  

export default viewRouter;
