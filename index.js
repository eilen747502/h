const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");

const axios = require('axios');
let https = require("https");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// http://localhost/login?code=0a33IH0w3eU6933dFX3w39qLSg23IH0B
// https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
app.get("/api/login", async (req, res) => {
  const query = req.query
  // console.log(query);

  // res.send({
  //   code: 0,
  //   data: query,
  // });
  // req.query
  // const url = 'https://api.weixin.qq.com/sns/jscode2session?grant_type=authorization_code&appid=wx8262bd6aafe26dd8&secret=secret&js_code='+query.code

  // https.get(url, (d) => {
  //   console.log('返回的信息: ', d);
  //   res.send({
  //     code: 0,
  //     data: JSON.parse(d),
  //   });
  // })


  axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    appid: 'wx8262bd6aafe26dd8',
    secret: 'acdcbf05ca2bde5aab7a0395c294e7b9',
    js_code: query.code,
    grant_type: 'authorization_code',
  })
  .then(function (response) {
    // console.log(response.session_key);
    res.send({
      code: 0,
      data: response,
    });
  })
  .catch(function (error) {

  })
  .finally(function () {

  });
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
