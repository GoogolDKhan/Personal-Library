/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const expect = require('chai').expect;
const mongodb = require('mongodb');
const mongoose = require('mongoose');

module.exports = function(app) {

  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

  let bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: [String]
  })

  let Book = mongoose.model('Book', bookSchema)

  app.route('/api/books')
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let arrayOfBooks =[]
			Book.find(
				{},
				(error, results) => {
					if(!error && results){
						results.forEach((result) => {
							let book = result.toJSON()
							book['commentcount'] = book.comments.length
							arrayOfBooks.push(book)
						})
						return res.json(arrayOfBooks)
					}
				}
			)
    })

    .post(function(req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(!title){
				return res.json('missing required field title')
			}
      let newBook = new Book({
				title: title,
				comments: []
			})
			newBook.save((error, savedBook) => {
				if(!error && savedBook){
					res.json(savedBook)
				}
			})
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      Book.deleteMany(
				{},
				(error, jsonStatus) => {
					if(!error && jsonStatus){
						return res.json('complete delete successful')
					}
				}
			)
    });



  app.route('/api/books/:id')
    .get(function(req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(
				bookid,
				(error, result) => {
					if(!error && result){
						return res.json(result)
					}else if(!result){
						return res.json('no book exists')
					}
				}
			)
    })

    .post(function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        return res.json('missing required field comment')
      }
      Book.findByIdAndUpdate(
				bookid,
				{$push: {comments: comment}},
				{new: true},
				(error, updatedBook) => {
					if(!error && updatedBook){
						return res.json(updatedBook)
					}else if(!updatedBook){
						return res.json('no book exists')
					}
				}
			)
    })

    .delete(function(req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndRemove(
				bookid,
				(error, deletedBook) => {
					if(!error && deletedBook){
						return res.json('delete successful')
					}else if(!deletedBook){
						return res.json('no book exists')
					}
				}
			)
    });

};
