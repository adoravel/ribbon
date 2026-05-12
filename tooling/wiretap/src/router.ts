import type { Config, Remote } from "./config.ts";

export interface Resolution {
	readonly upstreamUrl: URL;
	readonly remote?: Remote;
}

export function resolve(url: URL, config: Config): Resolution {
	for (const remote of config.remotes) {
		if (
			url.pathname === remote.localPath
			|| url.pathname.startsWith(remote.localPath + "/")
		) {
			const upstream = new URL(remote.upstream);
			upstream.pathname = url.pathname.slice(remote.localPath.length)
				|| "/";
			upstream.search = url.search;
			return { upstreamUrl: upstream, remote };
		}
	}

	const path = config.pathRewrites.get(url.pathname) ?? url.pathname;

	const upstreamUrl = new URL(config.primary);
	upstreamUrl.pathname = path;
	upstreamUrl.search = url.search;

	return { upstreamUrl };
}
