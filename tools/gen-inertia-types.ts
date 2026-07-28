import {
	readdirSync,
	mkdirSync,
	writeFileSync,
	watch
} from "node:fs";
import { resolve, join, relative, dirname } from "node:path";
import { parseArgs } from "node:util";
import { cwd, argv } from "node:process";

const DEBOUNCE_INTERVAL = 2000; // Wait time after last change before syncing

const { values } = parseArgs({
	args: argv.slice(2),
	options: {
		in: { type: "string" },
		out: { type: "string" },
	},
	strict: true,
});

const PAGES_DIR = resolve(cwd(), values.in || "/src/pages");
const OUTPUT_FILE = resolve(cwd(), values.out || "/src/inertia.d.ts");

function generateTypes() {
	const pages = scan(PAGES_DIR).sort();
	const content = `// Auto-generated file. Any manual changes will be lost when sources are regenerated.
declare global {
    type InertiaPage = ${pages.map((p) => `"${p}"`).join(" | ") || "string"};
}
export {};
`;

	mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
	writeFileSync(OUTPUT_FILE, content);
}

function scan(dir: string, base = dir): string[] {
	let pages: string[] = [];
	for (const file of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, file.name);
		if (file.isDirectory()) {
			pages.push(...scan(full, base));
		} else if (file.name.endsWith(".svelte")) {
			const path = relative(base, full);
			pages.push(path.slice(0, -7).replace(/\\/g, "/"));
		}
	}
	return pages;
}

let timeoutId: NodeJS.Timeout;

// Watch for changes
watch(PAGES_DIR, { recursive: true }, (eventType) => {
	if (eventType === "change") return; //ignore when file contents change

	if (timeoutId) {
		clearTimeout(timeoutId);
	}

	try {
		timeoutId = setTimeout(() => {
			generateTypes();
		}, DEBOUNCE_INTERVAL);
	} catch (err: unknown) {
		// Gracefully catch errors if files are locked
		console.error("Error occurred while generating types... ", err);
	}
});

console.info("Watching 👀for changes...");
