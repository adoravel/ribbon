#!/usr/bin/env -S deno run --unstable-bundle --allow-read --allow-write

interface UserscriptMetadata {
	name: string;
	namespace: string;
	version: string;
	description: string;
	author: string;
	match: string | string[];
	runAt?: "document-start" | "document-end" | "document-idle";
	grant?: string | string[];
	require?: string | string[];
	[key: string]: unknown;
}

interface BuildConfig {
	outputFilename: string;
	entrypoint: string;
	dev: boolean;
	metadata: UserscriptMetadata;
}

const ensureArray = (val: string | string[] | undefined): string[] =>
	Array.isArray(val) ? val : val ? [val] : [];

function formatMetadata(meta: UserscriptMetadata): string {
	const lines = Object.entries(meta).flatMap(([key, value]) => {
		const formattedKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();

		return ensureArray(value as string | string[] | undefined).map(
			(item) => `// @${formattedKey} ${item}`,
		);
	});

	return ["// ==UserScript==", ...lines, "// ==/UserScript=="].join("\n");
}

const assembleUserScript = (metadata: string, code: string): string =>
	`${metadata}\n\n${code}`;

async function bundle(
	dev: boolean,
): Promise<string> {
	const path = await Deno.makeTempFile();

	await Deno.bundle({
		entrypoints: ["src/main.ts"],
		outputPath: path,
		minify: !dev,
		sourcemap: dev ? "inline" : undefined,
		format: "iife",
		platform: "browser",
		write: true,
		external: [
			"GM",
		],
	});

	return Deno.readTextFileSync(path);
}

async function build(cfg: BuildConfig) {
	const code = await bundle(cfg.dev);
	const metadata = formatMetadata(cfg.metadata);

	const script = assembleUserScript(metadata, code);
	Deno.writeTextFileSync(cfg.outputFilename, script);

	console.log("🍅🧹");
}

const config: BuildConfig = {
	outputFilename: "ribbon.user.js",
	entrypoint: "src/main.ts",
	dev: new Set(Deno.args).has("--dev"),
	metadata: {
		name: "ribbon",
		namespace: "https://kyu.re/~ribbon",
		version: "0.1.0",
		description: "modular fluxer client mod",
		author: "kyu.re",
		match: ["*://*/*", "https://web.fluxer.app/*"],
		runAt: "document-start",
		grant: "none",
	},
};

if (import.meta.main) {
	await build(config);
}
