'use strict';
var router = require('express').Router();
var AV = require('leanengine');

var Course = AV.Object.extend('Course');
var Movies = AV.Object.extend('Movies');

var date = new Date()
console.log(date)
var fs = require('fs');


var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

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
      data  : loginedUser,
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

// 创建用户
router.get('/user/quit', function(req, res, next) {
  req.currentUser.logOut();
  res.clearCurrentUser();
  var result = {
    code : 200,
    message : '登出成功'
  }
  res.send(result);
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

router.get('/movie', function(req, res, next) {
  // var user = req.currentUser;
  // console.log(user)
  // if(!user){
  //   res.redirect("/login")
  //   return;
  // }

  var query = new AV.Query(Movies);
  query.equalTo("status",1)

  query.descending('createdAt');

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

router.get('/movie/:id', function(req, res, next) {
  var id = req.params.id;

  query.descending('createdAt');

  var query = new AV.Query(Movies);
  query.get(id).then(function(result){
    // 删除成功
    var result = {
        code : 200,
        data : result,
        message : '获取成功'
    }
    res.send(result);
  }, function(error) {
    res.send(error);
  }).catch(next);
});

router.delete('/movie/:id', function(req, res, next) {
  var id = req.params.id;

  var editObj = AV.Object.createWithoutData('Movies', id);
  editObj.set("status",0);
  editObj.save().then(function (editResult) {
    var result = {
        code : 200,
        data : editResult,
        message : 'success'
    }
    res.send(result);
  }, function (error) {
    var result = {
        code : 500,
        message : '保存出错'
    }
    res.send(result);
  }).catch(next);
});

router.put('/movie/:id',function(req, res, next) {
  // var user = req.currentUser;
  // console.log(user.get("username"))
  // var userId = user.get("username");

  var userId = req.body.userId

  if(!userId){
    var user = req.currentUser;
    console.log(user.get("username"))
    var userId = user.get("username");
  }

  var title = req.body.title
  var recommend = req.body.recommend
  var desc = req.body.desc
  var id = req.params.id;
  var movie = AV.Object.createWithoutData('Movies', id);
  movie.set("title",title);
  movie.set("recommend",recommend);
  movie.set("status",1)
  movie.save().then(function (addResult) {
    var result = {
      code : 200,
      data : addResult,
      message : '保存成功'
    }
    res.send(result);
  }, function (error) {
    console.log(error)
    var result = {
      code : 500,
      message : '保存出错'
    }
    res.send(result);
  });
})

router.get('/user/movie', function(req, res, next) {
  // var user = req.currentUser;
  // console.log(user.get("username"))
  // var username = user.get("username");

  var username = req.query.userId

  if(!username){
    var user = req.currentUser;
    console.log(user.get("username"))
    var username = user.get("username");
  }

  var query = new AV.Query(Movies);
  query.equalTo("userId",username);
  query.equalTo("status",1)

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

function saveFile(i,fileArray,filePartData,callback){
    if(i >= fileArray.length){//判断是否是最后一个文件
      return callback.success(filePartData);//返回成功上传
    }
    var fileData = fileArray[i];//获取一个文件信息
    fs.readFile(fileData.path, function(err, data){//读取文件
          if(err){//读取失败判断
        var data = "读取文件失败";
        return callback.error(data);//返回读取失败
      }
          var base64Data = data.toString('base64');//将文件转为base64
          var theFile = new AV.File(fileData.name, {base64: base64Data});//新建文件信息
          theFile.save().then(function(theFileData){//保存文件信息
            var url = theFileData.attributes.url;//获取成功保存后的文件链接
        filePartData[fileData.fieldName] = url;//将文件name保存到数据
        saveFile(i+1,fileArray,filePartData,callback);//递归代用该方法
          },function(error){
        console.log(error);
        return callback.error(data);//返回保存失败
      });
    });
}

router.post('/movie/add',multipartMiddleware,function(req, res, next) {
  console.log(req.files)
  var photo = req.files.photo;
  console.log(req)
  var url;

  var userId = req.body.userId

  if(!userId){
    var user = req.currentUser;
    console.log(user.get("username"))
    var userId = user.get("username");
  }

  var title = req.body.title
  var recommend = req.body.recommend
  var desc = req.body.desc

  fs.readFile(photo.path, function(err, data){
    if(err)
    return res.send("读取文件失败");
    var base64Data = data.toString('base64');
    var theFile = new AV.File(photo.name, {base64: base64Data});
    theFile.save().then(function(theFile){
      url = theFile.url();
      console.log(theFile.url());
      var movie = new Movies();
      movie.set("title",title);
      movie.set("recommend",recommend);
      movie.set("url",url);
      movie.set("userId",userId)
      movie.set("status",1)
      movie.save().then(function (addResult) {
        var result = {
          code : 200,
          data : addResult,
          message : '保存成功'
        }
        res.send(result);
      }, function (error) {
        console.log(error)
        var result = {
          code : 500,
          message : '保存出错'
        }
        res.send(result);
      });
    });
  });
})

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
