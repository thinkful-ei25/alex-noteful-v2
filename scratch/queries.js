'use strict';

const knex = require('../knex');

// GET NOTES WITH OPTIONAL SEARCH

// let searchTerm = 'gaga';
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });


// // GET NOTE BY ID
// let id = 1001;

knex
  .select('notes.id', 'title', 'content')
  .from('notes')
  .where('notes.id', id)
  .then(res => console.log(res[0]));

// UPDATE NOTE BY ID
// let id = 1001;
// const updateObj = {id: id, title: 'NEW MOREOTHERTITLE', content: 'NEWMOREOTHERCONTENT'};

knex('notes')
  .where('notes.id', id)
  .update(updateObj)
  .returning('*')
  .then(res => console.log(res[0]));


//CREATE NOTE
const newObj ={ title: 'newobject', content: 'othernewcontent'};

knex
  .insert(newObj)
  .into('notes')
  .returning('*')
  .then(res => console.log(res[0]));


//DELETE NOTE BY ID
// let id = 1008;

knex('notes')
  .where('notes.id', id)
  .del()
  .then(console.log);








