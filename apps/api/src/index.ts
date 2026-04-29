import 'dotenv/config'
import './types/index'
import { buildApp } from './app'

const app = buildApp()

const port = parseInt(process.env.PORT ?? '3001', 10)
const host = process.env.HOST ?? '0.0.0.0'

app.listen({ port, host }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
