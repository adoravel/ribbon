import type { Config } from "./config.ts";
import type { OriginMap } from "./rewrite.ts";
import { applyOriginMap, injectScript } from "./rewrite.ts";
import { sanitiseRequestHeaders, sanitiseResponseHeaders } from "./headers.ts";
import { resolve } from "./router.ts";

export default async function http(
	request: Request,
	config: Config,
	local: URL,
	origin: OriginMap,
	script: string,
): Promise<Response> {
	const { upstreamUrl } = resolve(new URL(request.url), config);
	let headers = sanitiseRequestHeaders(
		request.headers,
		upstreamUrl,
		local.origin,
	);

	let response: Response;
	try {
		response = await fetch(upstreamUrl, {
			method: request.method,
			headers: headers,
			body: request.method !== "GET" && request.method !== "HEAD"
				? request.body
				: null,
			redirect: "manual",
		});
	} catch (err) {
		console.error(`[wiretap] ${upstreamUrl}`, err);
		return new Response("Bad Gateway", { status: 502 });
	}

	const contentType = response.headers.get("content-type") ?? "";
	const isHtml = contentType.includes("text/html");
	const rewritable = isHtml || contentType.includes("application/json")
		|| contentType.includes("javascript");

	console.log(
		`[wiretap] ${request.method} ${
			new URL(request.url).pathname
		} · ${response.status} ${contentType || "-"}`,
	);

	headers = sanitiseResponseHeaders(
		response.headers,
		upstreamUrl,
		origin,
	);

	if (!rewritable) {
		return new Response(response.body, {
			status: response.status,
			headers,
		});
	}

	const text = await response.text();
	const body = applyOriginMap(
		isHtml ? injectScript(text, script) : text,
		origin,
	);

	headers.delete("content-length");
	if (isHtml) headers.set("content-type", "text/html; charset=utf-8");

	return new Response(body, {
		status: response.status,
		headers: headers,
	});
}
