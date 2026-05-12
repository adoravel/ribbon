import {
	filters,
	getFiber,
	getFiberName,
	op,
	walkDirty,
	walkDown,
	walkUp,
} from "./fiber.ts";

export default {
	fiber: {
		getFiber,
		getFiberName,
		walkUp,
		walkDown,
		walkDirty,
		filters,
		...op,
	},
};
