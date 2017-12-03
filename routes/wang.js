'use strict';
var router = require('express').Router();
var AV = require('leanengine');

var Todo = AV.Object.extend('Todo');

// 查询 Todo 列表
router.get('/', function(req, res) {
  var user = req.currentUser;
  res.render('wang/index', { user: user});
});
router.get('/like', function(req, res) {
  res.render('wang/like', { currentTime: new Date() });
});
router.get('/me', function(req, res) {
  var user = req.currentUser ? req.currentUser : '';
  console.log(user)
  res.render('wang/me', { user: user });
});
router.get('/detail', function(req, res) {
  res.render('wang/detail', { currentTime: new Date() });
});
router.get('/upload', function(req, res) {
  var id = req.query.id ? req.query.id : ""
  res.render('wang/upload', { id : id });
});

router.get('/uploaded', function(req, res) {
  res.render('wang/uploaded', { currentTime: new Date() });
});

router.get('/login', function(req, res) {
  res.render('wang/login', { currentTime: new Date() });
});
router.get('/signup', function(req, res) {
  res.render('wang/signup', { currentTime: new Date() });
});

module.exports = router;
