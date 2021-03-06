'use strict';

var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AV = require('leanengine');

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');

var app = express();

var requireAuthentication = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
}

//设置跨域访问
app.all('/v1/*', requireAuthentication);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(AV.Cloud.CookieSession({ secret: 'class>', maxAge: 3600000, fetchUser: true }));

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

// 设置默认超时时间
app.use(timeout('30s'));

// 加载云引擎中间件
app.use(AV.express());

app.enable('trust proxy');
// 需要重定向到 HTTPS 可去除下一行的注释。
// app.use(AV.Cloud.HttpsRedirect());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', function(req, res) {
  var user = req.currentUser;
  res.render('index', { user: user});
});
app.get('/like', function(req, res) {
  res.render('like', { currentTime: new Date() });
});
app.get('/me', function(req, res) {
  var user = req.currentUser ? req.currentUser : '';
  console.log(user)
  res.render('me', { user: user });
});
app.get('/detail', function(req, res) {
  res.render('detail', { currentTime: new Date() });
});
app.get('/upload', function(req, res) {
  var id = req.query.id ? req.query.id : ""
  res.render('upload', { id : id });
});

app.get('/uploaded', function(req, res) {
  res.render('uploaded', { currentTime: new Date() });
});

app.get('/login', function(req, res) {
  res.render('login', { currentTime: new Date() });
});
app.get('/signup', function(req, res) {
  res.render('signup', { currentTime: new Date() });
});


// 可以将一类的路由单独保存在一个文件中
app.use('/', require('./routes/index'));
app.use('/v1', require('./routes/v1'));
app.use('/wang', require('./routes/wang'));

app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers
app.use(function(err, req, res, next) {
  if (req.timedout && req.headers.upgrade === 'websocket') {
    // 忽略 websocket 的超时
    return;
  }

  var statusCode = err.status || 500;
  if (statusCode === 500) {
    console.error(err.stack || err);
  }
  if (req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  // 默认不输出异常详情
  var error = {};
  if (app.get('env') === 'development') {
    // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
    error = err;
  }
  res.render('error', {
    message: err.message,
    error: error
  });
});

module.exports = app;
