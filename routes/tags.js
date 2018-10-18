'use strict';

const express = require('express');

const knex =require('../knex');

const router = express.Router();


// GET ALL
router.get('/', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });

});

// GET BY ID
router.get('/:id/', (req, res, next) => {
  const id = req.params.id;
  knex
    .select('id', 'name')
    .from('tags')
    .where('tags.id', id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// POST/CREATE ITEM
router.post('/', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex
    .insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      // Uses Array index solution to get first item in results array
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

// UPDATE
router.put('/:id/', (req, res, next) => {
  const id = req.params.id;

  const { name } = req.body;

  const updateObj = {
    name: name
  };

  if (!updateObj.name) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .from('tags')
    .where('tags.id', id)
    .update(updateObj)
    .returning('*')
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {
      next(err);
    });
});

// DELETE

router.delete('/:id/', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('tags')
    .where('tags.id', id)
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;