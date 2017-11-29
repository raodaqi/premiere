'use strict';
var router = require('express').Router();
var AV = require('leanengine');

var Course = AV.Object.extend('Course');

var date = new Date()
console.log(date)

function validate(res,req,data){
  for(var i in data){
    if(req.method == 'GET'){
      var value = req.query[i];
    }else{
      var value = req.body[i];
    }
    if(data[i]){
      //必须值
      if(!value){
        var result = {
          code : '302',
          message : '缺少'+data[i],
          data : []
        }
        res.send(result);
        return '';
      }
    }
    data[i] = value;
  }
  return data;
}

// 创建用户
router.post('/user', function(req, res, next) {
  var data = {
      password : '密码',
      email    : '邮箱'
    }
  var data = validate(res,req,data);
  if(!data){
    return;
  }
  //创建应用
  var user = new AV.User();
  user.setUsername(data.email);
  user.setPassword(data.password);
  user.setEmail(data.email);
  // user.set("name",data.name);
  user.signUp().then(function (loginedUser) {
    var result = {
      code  : 200,
      data  : addResult,
      message : '注册成功'
    }
    res.saveCurrentUser(loginedUser);
    res.send(result);
  }, function(err) {
    console.log(err.code);
    var result = {
      code : err.code,
      message : err.message,
      data : []
    }
    res.send(result);
  }).catch(next);
});

//登陆
router.get('/user', function(req, res, next) {
  var data = {
      email : '邮箱',
      password : '密码'
    }
  var data = validate(res,req,data);
  if(!data){
    return;
  }
  AV.User.logIn(data.email, data.password).then(function (loginedUser) {
    // 登录成功
    var result = {
        code : 200,
        data : loginedUser,
        message : '登录成功'
    }
    res.saveCurrentUser(loginedUser);
    res.send(result);
  }, function(error) {
    res.send(error);
  }).catch(next);
});

router.get('/course', function(req, res, next) {
  var user = req.currentUser;
  console.log(user)
  if(!user){
    res.redirect("/login")
    return;
  }

  console.log(user["id"])

  var query = new AV.Query(Course);
  query.equalTo('userid',user["id"]);

  query.find().then(function(results) {
    var result = {
      code : 200,
      data : results,
      message : "success"
    }
    res.send(result);
  }, function(err) {
      if (err.code === 101) {
      //判断是否存在
        var result = {
            code : 200,
            data : [],
            message : "success"
        }
        res.send(result);
      } else {
        next(err);
      }
  }).catch(next);
});

router.post('/course', function(req, res, next) {
  var user = req.currentUser;
  console.log(user)
  if(!user){
    res.redirect("/login")
    return;
  }

  console.log(user["id"])

  var name = req.body.name;
  var week = req.body.week;
  var time = req.body.time;
  var address = req.body.address;

  var query = new AV.Query(Course);
  query.equalTo('userid',user["id"]);
  query.equalTo('week',week);
  query.equalTo('time',time);

  query.first().then(function(result) {
    //判断是否存在
    console.log(result);
    if(result){
      var id = result.id
      console.log(id)
      var course = AV.Object.createWithoutData('Course', id);
      course.set("name",name);
      course.set("week",week);
      course.set("time",time);
      course.set("address",address);
      course.set("userid",user["id"]);

      course.save().then(function (app) {
          var result = {
              code : 200,
              data : app,
              message : "success"
          }
          res.send(result);
      }, function (error) {
          var result = {
              code : 500,
              message : "保存出错"
          }
          res.send(result);
      });
      return;
    }
    var course = new Course();
    course.set("name",name);
    course.set("week",week);
    course.set("time",time);
    course.set("address",address);
    course.set("userid",user["id"]);
    course.save().then(function (course) {
      var result = {
        code : 200,
        data : course,
        message : "success"
      }
      res.send(result);
    }, function (error) {
      var result = {
        code : 500,
        message : "保存出错"
      }
      res.send(result);
    });                                              
  }, function(err) {
      if (err.code === 101) {
      //判断是否存在
        var result = {
            code : 200,
            data : [],
            message : "success"
        }
        res.send(result);
      } else {
        next(err);
      }
  }).catch(next);
});

router.get('/', function(req, res) {
  res.render('index', { currentTime: new Date() });
});

router.get('/login', function(req, res) {
  res.render('login', { currentTime: new Date() });
});

// 新增 Todo 项目
router.post('/', function(req, res, next) {
  var content = req.body.content;
  var todo = new Todo();
  todo.set('content', content);
  todo.save().then(function(todo) {
    res.redirect('/todos');
  }).catch(next);
});

module.exports = router;
