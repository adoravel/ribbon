import type { Config } from "./config.ts";

export type OriginMap = ReadonlyMap<string, string>;

export function isWebSocketUpgrade(requst: Request): boolean {
	return requst.headers.get("upgrade")?.toLowerCase() === "websocket";
}

export function buildOriginMap(config: Config, local: URL): OriginMap {
	const map = new Map<string, string>();
	map.set(config.primary.origin, local.origin);
	for (const remote of config.remotes) {
		const url = new URL(remote.upstream);
		const scheme = (url.protocol === "wss:" || url.protocol === "ws:")
			? "ws:"
			: "http:";
		map.set(url.origin, `${scheme}//${local.host}${remote.localPath}`);
	}
	return map;
}

export function applyOriginMap(input: string, map: OriginMap): string {
	let output = input;
	for (const [from, to] of map) output = output.replaceAll(from, to);
	return output;
}

export function buildScriptTag(js: string): string {
	return `<script id="wiretap-inject">\n${js}\n</script>\n`;
}

export function injectScript(html: string, tag: string): string {
	const idx = html.indexOf("</head>");
	return idx !== -1 ? html.slice(0, idx) + tag + html.slice(idx) : tag + html;
}
