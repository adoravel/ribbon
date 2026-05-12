import { applyOriginMap, type OriginMap } from "./rewrite.ts";

const denylist: Record<string, ReadonlySet<string>> = {
	headers: new Set([
		"content-security-policy",
		"content-security-policy-report-only",
		"strict-transport-security",
		"x-frame-options",
		"cross-origin-opener-policy",
		"cross-origin-embedder-policy",
		"cross-origin-resource-policy",
		"content-encoding",
		"connection",
		"keep-alive",
		"proxy-authenticate",
		"proxy-authorization",
		"te",
		"trailers",
		"transfer-encoding",
		"upgrade",
	]),
};

export function sanitiseRequestHeaders(
	input: Headers,
	upstream: URL,
	local: string,
): Headers {
	const output = new Headers();
	for (const [key, value] of input) {
		if (!denylist.headers.has(key.toLowerCase())) output.set(key, value);
	}

	if (output.has("host")) {
		output.set("host", upstream.host);
	}
	if (output.has("origin")) {
		output.set("origin", upstream.origin);
	}
	if (output.has("referer")) {
		output.set(
			"referer",
			output.get("referer")!.replace(local, upstream.origin),
		);
	}
	return output;
}

function rewriteSetCookie(cookie: string, upstream: string): string {
	return cookie
		.replace(/;\s*secure/gi, "")
		.replace(/;\s*samesite=[^;,]*/gi, "")
		.replace(
			new RegExp(`domain=\\.?${upstream}`, "gi"),
			"domain=localhost",
		);
}

export function sanitiseResponseHeaders(
	headers: Headers,
	upstream: URL,
	origin: OriginMap,
): Headers {
	const out = new Headers();
	for (const [k, v] of headers) {
		const lower = k.toLowerCase();
		if (denylist.headers.has(lower)) continue;
		out.set(k, lower === "location" ? applyOriginMap(v, origin) : v);
	}
	for (const cookie of headers.getSetCookie()) {
		out.append("set-cookie", rewriteSetCookie(cookie, upstream.hostname));
	}
	return out;
}
