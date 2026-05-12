const patched = Symbol("ribbon.webpack.patched");

type ExtractFunction<T> = T extends (...args: infer P) => infer R
	? (...args: P) => R
	: never;

export interface WebpackModuleInfo {
	id: string | number;
	loaded: boolean;
	exports: any;
}

export interface WebpackRequire {
	m: Record<string | number, WebpackFactory>;
	c: Record<string | number, WebpackModuleInfo>;
	e: (id: string | number) => Promise<void>;
	(id: string | number): WebpackModuleInfo;
}

export interface WebpackHooks {
	/** fired with the initial factory map once webpack's require function is ready */
	ready(factories: WebpackModuleSystem["factories"]): void;

	/** fired with new factories whenever a lazy chunk is pushed */
	chunkLoad(factories: Record<string, WebpackFactory>): void;
}

export type WebpackFactory =
	& ((module: WebpackModuleInfo, exports: any, wreq: WebpackRequire) => void)
	& { [patched]?: boolean };

export type WebpackJsonp =
	& [
		number[],
		Record<string, WebpackFactory>,
		((wreq: WebpackRequire) => any) | undefined,
	][]
	& { push: { [patched]?: boolean } };

export interface WebpackModuleSystem {
	factories: WebpackRequire["m"];
	cache: WebpackRequire["c"];
	require: ExtractFunction<WebpackRequire>;
}

export { patched as webpack$patched };
