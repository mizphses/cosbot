import { Hono } from 'hono'
import accounts from './routes/accounts'
import projects from './routes/projects'
import { cors } from 'hono/cors'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.get('/', async (c) => {
  return c.json({
    message: 'Working!',
  })
})

app.route('/accounts', accounts)
app.route('/projects', projects)

export default app
