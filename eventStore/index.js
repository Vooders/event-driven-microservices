const amqp = require('amqplib/callback_api')
const restify = require('restify')
const server = restify.createServer()

let history = []
const exchangeName = 'bob'

const addEvent = (eventData) => {
  const e = JSON.parse(eventData)
  console.log('adding', e)

  history.push({
    time: +new Date(),
    event: e.event,
    data: e.data
  })
}

amqp.connect('amqp://localhost', (err, conn) => {
  if (!err) {
    conn.createChannel((err, ch) => {
      if (!err) {
        ch.assertExchange(exchangeName, 'fanout', {durable: false})

        ch.assertQueue('', {exclusive: true}, (err, q) => {
          if (err) console.error(err)
          console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q.queue)
          ch.bindQueue(q.queue, exchangeName, '')

          ch.consume(q.queue, (msg) => {
            const messageString = msg.content.toString()
            console.log(' [x] %s', messageString)
            addEvent(messageString)
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

server.get('/get-events', (req, res, next) => {
  res.send(200, history)
})

server.listen(8000, () => {
  console.log('Event store is listening at %s', server.name, server.url)
})

module.exports = server
