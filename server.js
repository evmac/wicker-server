'use strict'

import Good from 'good'
import Hapi from 'hapi'
import HapiReactViews from 'hapi-react-views'
import Inert from 'inert'
import Vision from 'vision'

const server = new Hapi.Server()
const WICKER_PORT = 3000
const defaultContext = {
  title: 'wicker'
}

server.connection({port: process.env.PORT || WICKER_PORT})

server.register([
  {
    register: Good,
    options: {
      reporters: {
        console: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [
              {
                response: '*',
                log: '*'
              }
            ]
          }, 
          {
            module: 'good-console'
          }, 
          'stdout'
        ]
      }
    }
  },
  {register: Inert},
  {register: Vision}
], (err) => {
  if (err) throw err

  server.start((err) => {
    if (err) throw err
    
    server.log('info', `Wicker server running at ${server.info.uri}`)
  })
})

server.route([
  {
    method: 'GET', 
    path: '/{param*}', 
    handler: {
      directory: {
        path: 'assets',
        index: ['index.html']
      }
    }
  },
  {method: 'GET', path: '/', handler: {view: 'Library'}},
  {method: 'GET', path: '/{artist}', handler: {view: 'Artist'}},
  {method: 'GET', path: '/{artist}/{album}', handler: {view: 'Album'}}
])

server.views({
  engines: {jsx: HapiReactViews},
  relativeTo: __dirname,
  path: 'views',
  context: defaultContext
})
