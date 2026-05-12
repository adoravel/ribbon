import type { WebpackModuleInfo } from "@ribbon/types/webpack";

export type FilterFn = (exports: WebpackModuleInfo["exports"]) => boolean;

export * from "@ribbon/types/webpack";
