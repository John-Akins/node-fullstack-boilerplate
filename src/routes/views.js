/*
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  console.log('views');
  res.locals.name = 'pafradio';
  res.render('index');
});

export default router; */

const views = (app) => {
  // Setup routes, middleware, and handlers
  app.get('/', (req, res) => {
    res.locals.name = 'pafradio';
    res.render('index');
  });
};

export default views;
