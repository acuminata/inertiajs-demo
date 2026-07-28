import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { setRenderer } from "./middleware/renderer.ts";

const app = new Hono();

app.use("/static/*", serveStatic({ root: import.meta.dir }));

app.use(setRenderer());

app.get("/", async (ctx) => {
	return ctx.render("home", { name: "John" });
});
app.get("/about", async (ctx) => {
	return ctx.render("about");
});

export default app;
