import type {
	FilterFn,
	WebpackModuleInfo,
	WebpackRequire,
} from "types/webpack";
import { define } from "utils";

export let wreq: WebpackRequire;

export const filters = {
	byProps: (...props: string[]): FilterFn =>
		props.length === 1
			? (m) => m[props[0]] !== undefined
			: (m) => props.every((p) => m[p] !== undefined),

	byCode: (...code: (string | RegExp)[]): FilterFn => (m) => {
		if (typeof m !== "function") return false;
		const src = Function.prototype.toString.call(m);
		return code.every((c) =>
			typeof c === "string" ? src.includes(c) : (c.lastIndex = 0, c.test(src))
		);
	},

	byStoreName: (name: string): FilterFn => (m) =>
		m?.constructor?.displayName === name,
};

export function findModule(...props: string[]): any {
	if (!wreq?.c) {
		return null;
	}

	for (const id in wreq.c) {
		const mod = wreq.c[id];
		if (!mod?.loaded || !mod.exports || typeof mod.exports !== "object") {
			continue;
		}

		if (props.every((p) => p in mod.exports)) {
			return mod.exports;
		}

		const def = mod.exports.default;
		if (
			def != null
			&& (typeof def === "object" || typeof def === "function")
			&& props.every((p) => p in def)
		) {
			return def;
		}
	}
}

export function search(
	...patterns: (string | RegExp)[]
): WebpackModuleInfo | WebpackModuleInfo[] | null {
	if (!wreq?.c) {
		return null;
	}

	const results: WebpackModuleInfo[] = [];
	const filter = filters.byCode(...patterns);

	for (const id in wreq?.m) {
		if (filter(wreq.m[id]) && wreq.c[id]) {
			results.push(wreq.c[id]);
		}
	}

	if (results.length === 0) {
		console.warn("[ribbon] search: no match for", patterns);
	} else if (results.length === 1) {
		return results[0];
	} else {
		console.warn("[ribbon] search: multiple results for", patterns);
	}
	return results;
}

export function initialiseWebpack(webpackRequire: WebpackRequire) {
	console.log("[ribbon] :3");

	wreq = webpackRequire;

	define(webpackRequire.c, Symbol.toStringTag, {
		value: "Webpack Module Cache",
		enumerable: false,
	});
}
