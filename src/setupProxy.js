const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/pyxis-api', //proxy가 필요한 path parameter
    createProxyMiddleware({
      target: 'https://lib.inu.ac.kr', //타겟이 되는 api url
      changeOrigin: true, // 서버 구성에 따른 호스트 헤더 변경 여부 설정
      onProxyReq: (req) => {
        console.log(req)
      }
    })
  );
};