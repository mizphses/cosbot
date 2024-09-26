import { Hono } from 'hono'
import accounts from './routes/accounts'
import projects from './routes/projects'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', async (c) => {
  c.json({
    message: 'Working!',
  })
})

app.route('/accounts', accounts)
app.route('/projects', projects)

export default app
