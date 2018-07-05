const events = require('events')
const eventEmitter = new events.EventEmitter()
const restify = require('restify')
const server = restify.createServer()

const amqp = require('amqplib/callback_api')

const broadcastEvent = (eventName, eventData) => {
  const dataObject = {
    event: eventName,
    data: eventData
  }

  amqp.connect('amqp://localhost', (err, conn, event = eventName, data = dataObject) => {
    if (!err) {
      conn.createChannel((err, ch) => {
        if (!err) {
          ch.assertExchange('bob', 'fanout', {durable: false})
          ch.publish('bob', '', Buffer.from(JSON.stringify(data)))
          console.log(` [x] Sent '${data.event}'`)
        } else {
          console.error(err)
        }
      })
    } else {
      console.error(err)
    }
  })
}

const ThingRepository = require('./src/thingRepository')
const thingRepository = new ThingRepository(eventEmitter)

/* Eventy stuff */
eventEmitter.on('thingAdded', (thing) => {
  broadcastEvent('thingAdded', thing)
})
eventEmitter.on('addThingRequestReceived', (thing) => {
  thingRepository.addThing(thing)
})

/* Routers */
server.get('/add-thing/:thing', (req, res, next) => {
  eventEmitter.emit('addThingRequestReceived', req.params.thing)
  res.send(202)
})

server.get('/get-thing/:thing', (req, res, next) => {
  res.send(200, thingRepository.getThing(req.params.thing))
})

server.get('/view-things', (req, res, next) => {
  res.send(thingRepository.getAllThings())
})

server.listen(8001, () => {
  console.log('service A is listening at %s', server.name, server.url)
})

module.exports = server
