const amqp = require('amqplib/callback_api')
const restify = require('restify')
const http = require('http')
const server = restify.createServer()

let numberOfThings = 0

const incrementCount = () => {
  numberOfThings++
}

const checkEventStore = () => {
  const options = {
    port: 8000,
    host: 'localhost',
    path: '/get-events'
  }

  const req = http.get(options, (res) => {
    let bodyChunks = []
    res.on('data', (chunk) => {
      bodyChunks.push(chunk)
    }).on('end', () => {
      replayEvents(Buffer.concat(bodyChunks))
    })
  })

  req.on('error', (e) => {
    console.log('ERROR: ' + e.message)
  })
}

const replayEvents = (eventData) => {
  const events = JSON.parse(eventData)
  events.map((e) => {
    if (e.event === 'thingAdded') {
      incrementCount()
    }
  })
}

checkEventStore()

amqp.connect('amqp://localhost', (err, conn) => {
  if (!err) {
    conn.createChannel((err, ch) => {
      if (!err) {
        ch.assertExchange('bob', 'fanout', {durable: false})

        ch.assertQueue('', {exclusive: true}, (err, q) => {
          if (err) console.error(err)
          console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q.queue)
          ch.bindQueue(q.queue, 'bob', '')

          ch.consume(q.queue, (msg) => {
            console.log(' [x] %s', msg.content.toString())
            incrementCount()
          }, {noAck: true})
        })
      } else {
        console.error(err)
      }
    })
  } else {
    console.error(err)
  }
})

server.get('/get-count', (req, res, next, count = numberOfThings) => {
  res.send(200, { count: count })
})

server.listen(8002, () => {
  console.log('Service B is listening at %s', server.name, server.url)
})

module.exports = server
