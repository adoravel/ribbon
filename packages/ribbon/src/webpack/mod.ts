import { filters, initialiseWebpack, wreq } from "webpack/core";
import {
	webpack$patched as $patched,
	type WebpackModuleSystem,
} from "types/webpack";

import * as loader from "webpack/loader";

const webpack = {
	get factories(): WebpackModuleSystem["factories"] {
		return wreq?.m;
	},
	get cache(): WebpackModuleSystem["cache"] {
		return wreq?.c;
	},
	get require(): WebpackModuleSystem["require"] {
		return wreq;
	},
	core: {
		init: initialiseWebpack,
		filters,
	},
	loader,
	patched: $patched as typeof $patched,
};

export default webpack;
