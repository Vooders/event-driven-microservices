const restify = require('restify')
const server = restify.createServer()
const request = require('request')

const getCount = () => {
  let code = 404
  request
    .get('http://localhost:8002/get-count')
    .on('error', (err) => {
      console.log(err)
    })
    .on('response', (response) => {
      code = response.statusCode
    })
  console.log(code)
  // var x = null
  // request
  //   .get('http://localhost:8002/get-count', null, (err, res, body) => {
  //     if (err) console.error(err)
  //     if (res.statusCode !== 200) console.error('not 200')
  //     else {
  //       console.log('body', body)
  //       x = body
  //     }
  //   })
  //   .on('response', (res) => {
  //     console.log('response test:', res.body)
  //   })

  // return x
}

server.get('/get-count', (req, res) => {
  res.send(200, getCount())
})

server.listen(8003, () => {
  console.log('Service C is listening at %s', server.name, server.url)
})
