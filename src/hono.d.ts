declare module "hono" {
	interface ContextRenderer {
		(
			content: InertiaPage,
			props?: Record<string, unknown>,
		): Response | Promise<Response>;
	}
}

export {};
