import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { renderToReadableStream } from "hono/jsx/streaming";
import type { Context, MiddlewareHandler } from "hono";

const isProd = import.meta.env.NODE_ENV === "production";

const clientAssetsHtml = resolveAssetHtml(isProd, isProd ? readManifest() : {});

function resolveAssetHtml(isProduction: boolean, manifest: object) {
	if (!isProduction) {
		return `<script type="module" src="/src/client.ts"></script>`;
	}

	//In production, dynamically inject the compiled client assets
	const entry = manifest["src/client.ts"];
	if (!entry) {
		console.warn('Could not find "src/client.ts" in Vite manifest.');
	} else {
		let assetTag = `<script type="module" src="${entry.file}" defer></script>`;
		// If your entry point imports any CSS files, include them too
		if (entry.css && Array.isArray(entry.css)) {
			for (const cssFile of entry.css) {
				assetTag += `<link rel="stylesheet" href="${cssFile}">\n`;
			}
		}
		return assetTag;
	}
}

function readManifest(path = ".vite/manifest.json") {
	try {
		const manifestPath = resolve(import.meta.dirname, path);

		return JSON.parse(readFileSync(manifestPath, "utf-8"));
	} catch (e) {
		throw new Error('Vite manifest not found. Did you run "vite build"?', e);
	}
}

function template(data: object, ssrString?: string | null) {
	return `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            ${clientAssetsHtml}
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
	return (component, props) => {
		const localVersion = "1.0.0"; //optional asset version for cache busting

		const inertiaObject = {
			component,
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
