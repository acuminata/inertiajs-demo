import { createInertiaApp, type ResolvedComponent } from "@inertiajs/svelte";
import { mount } from "svelte";

import "./lib/assets/index.css";

await createInertiaApp({
	resolve: (name) => {
		const pages: Record<string, ResolvedComponent> = import.meta.glob("./pages/**/*.svelte", { eager: true });
		const page = pages[`./pages/${name}.svelte`];

		if (!page) {
			throw new Error(`Page not found: ${name}`);
		}
		return page;
	},
	setup({ el, App, props }) {
		mount(App, { target: el as Element, props });
	},
});
