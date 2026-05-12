export interface Remote {
	readonly upstream: string;
	readonly localPath: string;
}

export interface Config {
	readonly primary: URL;
	readonly port: number;
	readonly remotes: readonly Remote[];
	readonly pathRewrites: ReadonlyMap<string, string>;
}
