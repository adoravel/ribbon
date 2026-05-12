import type {
	WebpackFactory,
	WebpackJsonp,
	WebpackRequire,
} from "types/webpack";
import type { ExternalWebpackModule } from "types/extension";

import { wreq as webpackRequire } from "webpack/core";
import webpack from "webpack";
import { define } from "utils";

const cacheSymbol = Symbol.for("ribbon.cache.internal");
const externalWebpackModules = new Set<ExternalWebpackModule>();

function injectExternalWebpackModules(entry: WebpackJsonp[number]): void {
	const inject: Record<string, WebpackFactory> = {};
	const immediate: string[] = [];

	// todo: more robust webpack module injection
	for (const mod of externalWebpackModules) {
		inject[mod.id] = mod.fn;
		if (mod.immediate) immediate.push(mod.id);
	}

	if (!Object.keys(inject).length) return;

	Object.assign(entry[1], inject);
	if (immediate.length === 0) return;

	const prev = entry[2];
	entry[2] = (require: WebpackRequire) => {
		for (const id of immediate) {
			try {
				require(id);
			} catch (err) {
				console.error(
					`[ribbon] external module entrypoint "${id}" threw`,
					err,
				);
			}
		}
		prev?.(require);
	};
}

export function registerExternalWebpackModule(
	id: string,
	immediate: boolean,
	fn: ExternalWebpackModule["fn"],
) {
	externalWebpackModules.add({ id, fn, immediate });
}

function interceptWebpackModuleLoader(fn: (jsonp: WebpackJsonp) => void) {
	let chunk: WebpackJsonp | undefined;

	define(window, "webpackChunkerfluxer_app", {
		set(jsonp: WebpackJsonp) {
			fn(chunk = jsonp);
		},
		get: () => chunk,
	});
}

function beforeChunkPush(
	jsonp: WebpackJsonp,
	fn: (...args: Parameters<WebpackJsonp["push"]>) => void,
) {
	let original: WebpackJsonp["push"] = jsonp.push;
	if (original[webpack.patched]) {
		return;
	}

	const patch: typeof original = (args) => {
		try {
			fn(args);
		} catch (err) {
			console.error("[ribbon] chunk push hook error:", err);
		}
		try {
			return original.apply(jsonp, [args]);
		} catch (err) {
			return console.error("[ribbon] chunk push error", err), 0;
		}
	};

	patch.bind = (t: any, ...args: any[]) => original.bind(t, ...args);
	patch[webpack.patched] = true;

	Object.defineProperty(jsonp, "push", {
		set(push: WebpackJsonp["push"]) {
			console.trace("[ribbon] updating orig webpack push func", push);
			original = push;
		},
		get: () => patch,
	});
}

function patchWebpackFactoryPrepopulation(
	fn: (this: WebpackRequire, mods: Record<string, WebpackFactory>) => void,
) {
	define(Function.prototype, "m", {
		set(this: WebpackRequire, factories: Record<string, WebpackFactory>) {
			console.trace("[ribbon] hi webpack");

			define(this, "m", { value: factories });
			const { stack } = new Error();

			if (!stack?.includes("/assets/")) {
				return;
			}

			if (!Reflect.deleteProperty(Function.prototype, "m")) {
				console.error("[ribbon] failed to hook into webpack factories");
			}

			let cache;
			const unhookCacheRetrieval = define(Object.prototype, cacheSymbol, {
				get() {
					cache = this;
					return { exports: {} };
				},
			});

			this(cacheSymbol as any);
			unhookCacheRetrieval();

			if (cache) delete cache[cacheSymbol];
			this.c = cache! as WebpackRequire["c"];

			define(factories, Symbol.toStringTag, {
				enumerable: false,
				value: "Module Factories",
			});

			fn.call(this, factories);
		},
	});
}

export function interceptWebpackModuleSystem() {
	const { promise, resolve } = Promise.withResolvers<void>();

	registerExternalWebpackModule("ribbon", true, (_info, _exports, require) => {
		if (webpackRequire == null) webpack.core.init(require);
	});

	interceptWebpackModuleLoader((jsonp) => {
		beforeChunkPush(jsonp, injectExternalWebpackModules);
	});

	// making injectExternalWebpackModules happier
	patchWebpackFactoryPrepopulation((mods) => {
		const deceive: WebpackJsonp[number] = [[-1], { ...mods }, undefined];
		injectExternalWebpackModules(deceive);

		const [, fax, entrypoint] = deceive;

		const keys = Object.keys(mods);
		const diff = Object.keys(fax).filter((key) => !keys.includes(key));

		for (const id of diff) {
			mods[id] = fax[id];
		}
		if (entrypoint) {
			window.webpackChunkfluxer_app?.push([[-2], {}, entrypoint]);
		}

		resolve();
	});

	return promise;
}
