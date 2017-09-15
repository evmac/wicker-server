'use strict'

import CloudRail from 'cloudrail-si'
import Good from 'good'
import Hapi from 'hapi'
import HapiReactViews from 'hapi-react-views'
import Inert from 'inert'
import Store from 'nedb'
import Vision from 'vision'
import fs from 'fs'

import Library from './Library'
import config from './wicker.config'
import usrConfig from './user.config'

const OneDrive
const LibraryStore = new Datastore({filename: `${__dirname}/library.db`})
const defaultContext = {
  title: 'wicker'
}
const library
const server = new Hapi.Server()

server.connection({port: process.env.PORT || config.WICKER_PORT})

server.register([
  {
    register: Good,
    options: {
      reporters: {
        console: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{
              response: '*',
              log: '*'
            }]
          },
          {module: 'good-console'}, 
          'stdout'
        ]
      }
    }
  },
  {register: Inert},
  {register: Vision}
], (err) => {
  if (err) {
    server.log('error', err)

    throw err
  }

  server.start((err) => {
    if (err) {
      server.log('error', err)

      throw err
    }
    
    server.log('info', `Wicker server running at ${server.info.uri}.`)
    
    LibraryStore.loadDatabase((err) => {
      if (err) {
        server.log('error', err)

        throw err
      }

      server.log('info', 'Local library loaded from disk.')
    })

    CloudRail.Settings.setKey(config.CLOUDRAIL_LICENSE_KEY)
    OneDrive = new CloudRail.services.OneDrive(null, config.ONEDRIVE_CLIENT_ID, config.ONEDRIVE_CLIENT_SECRET, null, null)

    OneDrive.login((err) => {
      if (err) {
        server.log('error', err)

        throw err
      }

      server.log('info', 'Logged into OneDrive.')

      OneDrive.getChildren(usrConfig.ONEDRIVE_LIBRARY_ENTRY_PATH, (err, res) => {
        if (err) {
          server.log('error', err)
  
          throw err
        }

        server.log('info', `Opened directory ${usrConfig.ONEDRIVE_LIBRARY_ENTRY_PATH}.`)

        // TODO: based on what the response object looks like, build library from here
        server.log('debug', res)
      })
    })

    OneDrive.logout((err) => {
      if (err) {
        server.log('error', err)

        throw err
      }
      
      server.log('info', 'Logged out of OneDrive.')
    })
  })
})

server.views({
  engines: {jsx: HapiReactViews},
  relativeTo: __dirname,
  path: 'views',
  context: defaultContext
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
