/**
 * Copyright (c) 2025 kyu.re
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Fiber } from "./react.ts";
import type { WebpackJsonp } from "./webpack.ts";

export {};

declare global {
	const browser: import("webextension-polyfill-types").Browser;

	interface Window {
		webpackChunkfluxer_app: WebpackJsonp;
	}

	interface Element {
		[k: `__reactFiber$${string}`]: Fiber;
		[k: `__reactProps$${string}`]: Record<string, unknown>;
	}
}
