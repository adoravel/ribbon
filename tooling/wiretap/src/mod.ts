import { resolve } from "./router.ts";
import {
	buildOriginMap,
	buildScriptTag,
	isWebSocketUpgrade,
} from "./rewrite.ts";

import http from "./http.ts";
import websocket from "./websocket.ts";

export { type Config } from "./config.ts";

export default {
	http,
	websocket,
	router: {
		resolve,
	},
	rewrite: {
		buildOriginMap,
		buildScriptTag,
		isWebSocketUpgrade,
	},
};
