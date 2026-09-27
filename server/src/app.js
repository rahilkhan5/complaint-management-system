import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import routes from './routes/index.js'

const app = express()

// CLIENT_URL can list more than one address, separated by commas (for example the live site and localhost)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((url) => url.trim())
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
