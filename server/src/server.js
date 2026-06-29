import { connectDB, disconnectDB } from './config/db.js'
import { env } from './config/env.js'
import { app } from './app.js'

let server

async function start() {
  await connectDB()
  server = app.listen(env.PORT, () => {
    console.log(`CP Performance Analyzer API listening on port ${env.PORT}`)
  })
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`)
  server?.close(async () => {
    await disconnectDB()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

start().catch((error) => {
  console.error('Failed to start API:', error.message)
  process.exit(1)
})
