import type { Context, MiddlewareHandler } from "hono";
import { renderToReadableStream } from "hono/jsx/streaming";

function template(data: object, ssrString?: string | null) {
    let assetTag;

    if (import.meta.env.NODE_ENV === "production") {
        // todo: figure out how to get the hash
        assetTag =
            `<script type="module" src="/static/client-B2footOV.js" defer></script>`;
    } else {
        assetTag = `
			 <script type="module" src="http://localhost:5173/@vite/client"></script>
            <script type="module" src="http://localhost:5173/src/client.ts"></script>`;
    }

    return `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            ${assetTag}
          </head>
          <body id="app">            
            <script data-page="app" type="application/json">
				${JSON.stringify(data).replace(/'/g, "&#39;")}
           </script>
           ${ssrString || ""}
          </body>
        </html>
     `;
}

function create(ctx: Context) {
    return (children, props) => {
        const localVersion = "1.0.0"; //optional asset version for cache busting

        const inertiaObject = {
            component: children,
            props,
            url: new URL(ctx.req.url).pathname,
            version: ctx.req.header("X-Inertia-Version") || localVersion,
        };

        const isInertiaRequest = ctx.req.header("X-Inertia") === "true";

        if (!isInertiaRequest) {
            ctx.header("Transfer-Encoding", "chunked");
            ctx.header("Content-Type", "text/html; charset=UTF-8");
            ctx.header("Content-Encoding", "Identity");

            const content = template(inertiaObject);
            return ctx.body(renderToReadableStream(content));
        }

        if (
            ctx.req.header("X-Inertia-Version") &&
            localVersion === ctx.req.header("X-Inertia-Version")
        ) {
            ctx.header("Vary", "Accept");
            ctx.header("X-Inertia", "true");
            return ctx.json(inertiaObject);
        } else {
            ctx.header("X-Inertia-Location", inertiaObject.url);
            ctx.status(409);
            return ctx.body(null);
        }
    };
}

export function setRenderer(): MiddlewareHandler {
    return async (ctx, next) => {
        ctx.setRenderer(create(ctx));
        return next();
    };
}
