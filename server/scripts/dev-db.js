// Runs a real MongoDB server on this computer for development, with no installation needed.
// Data is saved in server/.data/db so it survives restarts.
// The first run downloads the MongoDB binary once (about 100 MB).
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MongoMemoryServer } from 'mongodb-memory-server'

const PORT = Number(process.env.DEV_DB_PORT) || 27017
const dbPath = fileURLToPath(new URL('../.data/db', import.meta.url))
mkdirSync(dbPath, { recursive: true })

const mongod = await MongoMemoryServer.create({
  instance: { port: PORT, dbPath, storageEngine: 'wiredTiger' },
})

console.log(`Local MongoDB running at ${mongod.getUri()}`)
console.log(`Data folder: ${dbPath}`)

async function shutdown() {
  // doCleanup: false keeps the data files for next time
  await mongod.stop({ doCleanup: false })
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
