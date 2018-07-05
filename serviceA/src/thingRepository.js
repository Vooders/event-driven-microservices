const randomstring = require('randomstring')
const http = require('http')

class ThingRepository {
  constructor (eventEmitter) {
    this.eventEmitter = eventEmitter
    this.things = []
    this.checkEventStore()
  }

  checkEventStore () {
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
        this.replayEvents(Buffer.concat(bodyChunks))
      })
    })

    req.on('error', (e) => {
      console.log('ERROR: ' + e.message)
    })
  }

  replayEvents (eventData) {
    console.log('TEST:', JSON.parse(eventData))
    if (eventData) {
      const events = JSON.parse(eventData)
      events.map((e) => {
        if (e.event === 'thingAdded') {
          this.ingestThing(e.data)
        }
      })
    }
  }

  thingGenerator (key) {
    return {
      [key]: {
        [randomstring.generate()]: randomstring.generate(),
        [randomstring.generate()]: randomstring.generate(),
        [randomstring.generate()]: randomstring.generate(),
        [randomstring.generate()]: randomstring.generate(),
        [randomstring.generate()]: randomstring.generate()
      }
    }
  }

  ingestThing (thingData) {
    this.things.push(thingData)
  }

  addThing (key) {
    const data = this.thingGenerator(`${key}`)
    this.things.push(data)
    this.eventEmitter.emit('thingAdded', data)
  }

  getThing (key) {
    var result = -1
    this.things.forEach((item, index) => {
      if (key === Object.keys(item).join('')) {
        result = index
      }
    })
    if (result >= 0) {
      return this.things[result]
    } else {
      return null
    }
  }

  getAllThings () {
    return this.things
  }
}

module.exports = ThingRepository
