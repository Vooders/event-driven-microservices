'use strict'

const expect = require('chai').expect
const path = require('path')
const { Pact } = require('@pact-foundation/pact-node/src/pact')
const getMeDogs = require('../index').server

describe('Service A', () => {
  let url = 'http://localhost'
  const port = 8001

  const provider = new Pact({
    port: port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    consumer: 'MyConsumer',
    provider: 'MyProvider',
    pactfileWriteMode: 'merge'
  })

  const EXPECTED_BODY = {
    'bob': {
      '0Yrg1Yo6qVAilR34cPYqielGHLTBVslC': 'kP0EN6YJbe3pysWY5axiQNLv7y4bl2Vz',
      '8UvTwGqoZs0tT4M2icm4itNlkqkLMfcj': 'AEP7Qh8gT7pMQea7JfeAH3XX3A1Q9Qmi',
      'Oyf5CTosSE9AaADb0mHSdWt73edj8TnD': 'LDWd5mgNGzWQWo9IGRTni3Rbe4eVvqG0',
      'qmsDgCuVHuy71I2Hb7F5uJ0KoS47kTgO': 'k4hrtTKS8Lw7TImTLRLDFjUaBvFOKokt',
      'PoEV9sL9dhe8zS33wBUACn7JTRtJw3NZ': 'S5YnKUaHo1G5JBSzz1lRLIhEzF8TzrtW'
    }
  }

  before(() => provider.setup())

  after(() => provider.finalize())

  describe('get /get-thing/bob', () => {
    before(done => {
      const interaction = {
        state: 'bob exists',
        uponReceiving: 'a request for bob',
        withRequest: {
          method: 'GET',
          path: '/get-thing/bob',
          headers: {
            'Accept': 'application/json'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: EXPECTED_BODY
        }
      }
      provider.addInteraction(interaction).then(() => {
        done()
      })
    })

    it('returns the correct response', done => {
      const urlAndPort = {
        url: url,
        port: port
      }
      getMeDogs(urlAndPort)
        .then(response => {
          expect(response.data).to.eql(EXPECTED_BODY)
          done()
        }, done)
    })

    // verify with Pact, and reset expectations
    afterEach(() => provider.verify())
  })
})
