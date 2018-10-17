'use strict';

const express = require('express');

const router = express.Router();

const knex =require('../knex');

//GET ALL FOLDERS
router.get('/', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

//GET FOLDER BY ID
router.get('/:id', (req, res, next) =>{
  const id = req.params.id;
  knex
    .select('id', 'name')
    .from('folders')
    .where('folders.id', id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

//UPDATE FOLDER
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const updateObj = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status=400;
    return next(err);
  }

  knex
    .from('folders')
    .where('folders.id', id)
    .update(updateObj)
    .returning('*')
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {
      next(err);
    });
});

//CREATE A FOLDER (ACCEPTS OBJECT WITH NAME AND INSERTS INTO DB, 
//RETURNS THE NEW ITEM ALONG THE NEW ID)
router.post('/', (req, res, next) => {
  const { name } = req.body;

  const newFolder= { name };

  if (!newFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status= 400;
    return next(err);
  }

  knex 
    .insert(newFolder)
    .into('folders')
    .returning('*')
    .then(results => {
      res.status(201).json(results[0]);
    })
    .catch(err => {
      next(err);
    });
});

//DELETE FOLDER BY ID(ACCEPTS AN ID AND DELETS FOLDER FROM DB,
//RETURNS A 204 STATUS)

router.delete('/:id/', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('folders')
    .where('folders.id', id)
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;