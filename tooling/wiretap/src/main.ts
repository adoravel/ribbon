import wiretap, { type Config } from "./mod.ts";

export const config: Config = {
	primary: new URL("https://web.fluxer.app"),
	port: 13367,
	remotes: [
		{ upstream: "wss://gateway.fluxer.app", localPath: "/_r/gateway" },
		{ upstream: "https://api.fluxer.app", localPath: "/_r/api" },
	],
	pathRewrites: new Map([
		["/.well-known/fluxer", "/api/.well-known/fluxer"],
	]),
};

export function start(
	config: Config,
	userscript: string,
): Deno.HttpServer {
	const local = new URL(`http://localhost:${config.port}`);
	const origin = wiretap.rewrite.buildOriginMap(config, local);
	const script = wiretap.rewrite.buildScriptTag(userscript);

	function handle(request: Request): Response | Promise<Response> {
		if (wiretap.rewrite.isWebSocketUpgrade(request)) {
			const { upstreamUrl: upstream } = wiretap.router.resolve(
				new URL(request.url),
				config,
			);
			return wiretap.websocket(request, upstream);
		}
		return wiretap.http(request, config, local, origin, script);
	}

	return Deno.serve(
		{
			port: config.port,
			onListen: ({ port }) =>
				console.log(
					`[wiretap] http://localhost:${port}  ·  ${config.primary.origin}`,
				),
		},
		handle,
	);
}

const userscript = Deno.readTextFileSync("userscript.js");

start(config, userscript);
