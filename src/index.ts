import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))



app.get('/', async(ctx)=>{

  return ctx.html("<strong> Hello there. </strong>")
});

export default app