import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { setRenderer } from "./middleware/renderer.ts";

const app = new Hono();


app.use(setRenderer());

app.get('/', async(ctx)=>{

  return ctx.html("<strong> Hello there. </strong>")
});

export default app;
