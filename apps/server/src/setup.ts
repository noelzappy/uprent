import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { Database } from 'bun:sqlite'
import { initDatabase } from './db-init'

const allowedOriginRegex = /http:\/\/localhost:\d+/

const database = new Database('./db.sqlite')

initDatabase(database)

export const setup = new Elysia({ name: 'setup' })
  .use(
    cors({
      origin: ({ headers }) => {
        const origin = headers.get('origin')
        return (
          !origin ||
          origin === 'chrome-extension://nnjokgfpoecefilcbmcinacgmefmdabl' ||
          allowedOriginRegex.test(origin)
        )
      },
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Access-Control-Allow-Credentials',
        'Set-Cookie',
        'Is-Extension',
      ],
    }),
  )
  .decorate('db', database)

export type AppWithSetup = typeof setup
