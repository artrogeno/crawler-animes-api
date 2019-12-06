import dotenv from 'dotenv'
import { env } from 'process'
import { Server } from './shared/config/server'

dotenv.config({
  path: '.env',
})

const port = Number(env.API_PORT) || 3000

new Server().start().then(server => {
  server.listen(port)
  server.on('error', error => {
    if (error.syscall !== 'listen') {
      throw error
    }
    switch (error.code) {
      case 'EACCES':
        console.error('Port requires elevated privileges')
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.log('Port is already in use')
        process.exit(1)
        break
      default:
        throw error
    }
  })
  server.on('listening', () => {
    console.log(
      `Server is running in process ${process.pid} listening on PORT ${port}\n`
    )
  })
})
