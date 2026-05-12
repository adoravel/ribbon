import type { WebpackFactory } from "./webpack.ts";
import type { Semver } from "./versioning.ts";

export interface ExtensionContributor {
	id: bigint;
}

export interface ExtensionManifest<V extends string = string> {
	schema: "ribbon/extension/v0.1.0";
	id: string;
	version: Semver<V>;
	meta: ExtensionMeta;
}

export interface ExtensionMeta {
	name?: string;
	description?: string;
	contributors: ExtensionContributor[];
}

export interface ExternalWebpackModule {
	id: string;
	fn: WebpackFactory;
	immediate: boolean;
}
