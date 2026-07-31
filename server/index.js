import express from 'express'
import cors from 'cors'
import {
  fetchImagesFromUpstream,
  fetchLocationsFromUpstream,
  fetchPropertiesFromUpstream,
} from '../api/_lib/pagibig.js'
import { subscribeToPush, unsubscribeFromPush } from '../api/_lib/push-store.js'

const PORT = process.env.PORT ?? 3001

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/properties', async (req, res) => {
  const { status, body } = await fetchPropertiesFromUpstream(req.query)
  res.status(status).json(body)
})

app.get('/api/locations', async (req, res) => {
  const { status, body } = await fetchLocationsFromUpstream(req.query)
  res.status(status).json(body)
})

app.post('/api/images', async (req, res) => {
  const { status, body } = await fetchImagesFromUpstream(req.body)
  res.status(status).json(body)
})

app.post('/api/push-subscribe', async (req, res) => {
  const { status, body } = await subscribeToPush(req.body)
  res.status(status).json(body)
})

app.delete('/api/push-subscribe', async (req, res) => {
  const { status, body } = await unsubscribeFromPush()
  res.status(status).json(body)
})

app.listen(PORT, () => {
  console.log(`Pag-IBIG API proxy listening on http://localhost:${PORT}`)
})
