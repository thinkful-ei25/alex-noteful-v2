'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Sanity check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});


describe('Static Server', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe('Noteful API', function() {
  const seedData = require('../db/seedData');

  beforeEach(function () {
    return seedData('./db/noteful.sql');
  });

  after(function() {
    return knex.destroy();
  });


  describe ('GET /api/notes', function() {
    it('should return the default of 10 Notes', function(){
      return chai.request(app)
        .get('/api/notes')
        .then(function(res){
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(10);
        });
    });
    
    it('should return correct search results for a valid searchTerm', function(){
      return chai.request(app)
        .get('/api/notes?searchTerm=about%20cats')
        .then(function(res){
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(4);
          expect(res.body[0]).to.be.an('object');
        });
    });
  });

  describe('404 handler', function (){
    it('should respond with 404 when given a bad path', function (){
      return chai.request(app)
        .get('/api/random')
        .then(function(res){
          expect(res).to.have.status(404);
        });
    });
  });

  describe('GET /api/notes', function(){
    it('should return an array of objects where each item contains id, title, and content', function (){
      return chai.request(app)
        .get('/api/notes')
        .then(function(res){
          const expectedKeys = ['id', 'title', 'content'];
          res.body.forEach(function(item){
            expect(item).to.be.a('object');
            expect(item).to.include.keys(expectedKeys);
          });
        });
    });

    it('should return an empty array for an incorrect searchTerm', function() {
      let searchTerm = 'asdasdasdasdas';
      return chai.request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`)
        .then(function(res){
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array').that.is.empty;
        });
    });
  });

  describe('GET /api/notes/:id', function(){
    it('should return correct note when given an id', function(){
      let testId = 1001;
      return chai.request(app)
        .get(`/api/notes/${testId}`)
        .then(function(res){
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.include({id: testId});
        });
    });

    it('should respond with a 404 for an invalid id', function(){
      let testId = 9999;
      return chai.request(app)
        .get(`/api/notes/${testId}`)
        .then(function(res){
          expect(res).to.have.status(404);
        });
    });
  });

  describe('POST /api/notes', function(){
    it('should create and return a new item when provided valid data', function(){
      const newItem = { title:"testarticle", content:"testcontent", folder_id: 100, tags:[10] };
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function(res){
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'folderId', 'folderName', 'tags');
          expect(res.body.id).to.not.equal(null);
        });
    });

    it('should return an error when missing "title" field', function(){
      const newItem = { content:"testcontent", folder_id: 100, tags:[10] };
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function(res){
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.string('Missing `title` in request body');
        });
    });
  });

  describe('PUT /api/notes/:id', function(){
    it('should update the note', function(){
      const updateItem = { title: 'updatetitle', content: 'updatecontent', folderId: 100, tags:[12]};
      return chai.request(app)
        .get('/api/notes')
        .then(function(res){
          updateItem.id = res.body[0].id;
          return chai.request(app)
            .put(`/api/notes/${updateItem.id}`)
            .send(updateItem);
        })
        .then(function(res){
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.be.a('object');

        });
    });

    it('should respond with 404 for an invalid id', function(){
      const updateItem = { id: 9999, title: 'updatetitle', content: 'updatecontent', folderId: 100, tags:[12]};
      return chai.request(app)
        .put(`/api/notes/${updateItem.id}`)
        .send(updateItem)
        .then(function(res){
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "title" field', function(){
      const updateItem = { id: 1001, content: 'updatecontent', folderId: 100, tags:[12]};
      return chai.request(app)
        .put(`/api/notes/${updateItem.id}`)
        .send(updateItem)
        .then (function(res) {
          expect(res).to.have.status(400);
          expect(res.body.message).to.be.string('Missing `title` in request body');
        });
    });
  });

  describe('DELETE /api/notes/:id', function(){
    it('should delete an item by id', function() {
      return chai.request(app)
        .get('/api/notes')
        .then(function(res){
          return chai.request(app)
            .delete(`/api/notes/${res.body[0].id}`);
        })
        .then(function (res){
          expect(res).to.have.status(204);
        });
    });
  });
});