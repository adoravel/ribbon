/// <reference lib="dom" />

import {
	$$context,
	$$forwardRef,
	$$fragment,
	$$lazy,
	$$memo,
	$$provider,
	type Fiber,
	type ReactContext,
	type ReactForwardRefType,
	type ReactMemoType,
	type ReactProviderType,
	type SpecialFiberType,
	SUBTREE_MASK,
} from "@ribbon/types/react";

export const getFiber = createLazyAccessor<Fiber>("__reactFiber$");

export const getProps = createLazyAccessor<Record<string, unknown>>(
	"__reactProps$",
);

function createLazyAccessor<T>(
	prefix: string,
): (element: Element) => T | undefined {
	let cachedKey: string | undefined;

	function findKey(element: Element): string | undefined {
		if (cachedKey !== undefined && cachedKey in element) return cachedKey;
		return (cachedKey = Object.keys(element).find((k) => k.startsWith(prefix)));
	}

	return function (element: Element): T | undefined {
		const key = findKey(element);
		return key !== undefined ? (element as any)[key] as T : undefined;
	};
}

const fnName = (f: Function): string =>
	typeof f === "function"
		? ((f as { displayName?: string }).displayName || f.name || "(anonymous)")
		: "(anonymous)";

export function getFiberName(fiber: Fiber | null | undefined): string {
	if (!fiber) return "(null)";
	const type = fiber.elementType ?? fiber.type;

	if (typeof type === "string") {
		return type; // e.g. "div"
	}
	if (typeof type === "function") {
		return fnName(type);
	}

	const s = type as SpecialFiberType;
	switch (s.$$typeof) {
		case $$memo:
			return `Memo(${fnName((s as ReactMemoType).type as Function)})`;
		case $$forwardRef:
			return `ForwardRef(${fnName((s as ReactForwardRefType).render)})`;
		case $$fragment:
			return "Fragment";
		case $$context:
			return (s as ReactContext<any>).displayName ?? "Context";
		case $$provider:
			return `${
				(s as ReactProviderType<any>)._context?.displayName ?? "Context"
			}.Provider`;
		case $$lazy:
			return "Lazy";
		default:
			return `tag(${fiber.tag})`;
	}
}

/**
 * iterative depth-first walk (child before sibling)
 */
export function* walkDown(
	root: Fiber | null | undefined,
	shouldDescend?: (f: Fiber, depth: number) => boolean,
	maxDepth = 64,
): Generator<Fiber> {
	if (!root) return;
	const stack: [Fiber, number][] = [[root, 0]];
	while (stack.length) {
		const [fiber, depth] = stack.pop()!;
		yield fiber;
		if (fiber.sibling) stack.push([fiber.sibling, depth]);
		if (
			fiber.child && depth < maxDepth
			&& (!shouldDescend || shouldDescend(fiber, depth))
		) {
			stack.push([fiber.child, depth + 1]);
		}
	}
}

export function* walkUp(
	fiber: Fiber | null | undefined,
	maxDepth = 64,
): Generator<Fiber> {
	let node = fiber;
	let depth = 0;
	while (node && depth++ < maxDepth) {
		yield node;
		node = node.return;
	}
}

/**
 * walk downward but only enter subtrees that have pending work
 */
export function* walkDirty(
	fiber: Fiber | null | undefined,
	maxDepth = 64,
): Generator<Fiber> {
	if (!fiber) return;

	if (!("subtreeFlags" in fiber)) {
		console.trace("[ribbon] no subtree flags");
		yield* walkDown(fiber, undefined, maxDepth);
		return;
	}

	yield* walkDown(
		fiber,
		(f) => ((f as any).subtreeFlags & SUBTREE_MASK) !== 0,
		maxDepth,
	);
}

export const filters = {
	hasProp: (prop: string) => (f: Fiber) => prop in (f.pendingProps ?? {}),

	hasProps: (...props: string[]) => (f: Fiber) =>
		props.every((p) => p in (f.pendingProps ?? {})),

	named: (name: string) => (f: Fiber) => getFiberName(f) === name,
	isDOMFiber: (f: Fiber) => typeof f.type === "string",

	hasStateNode: (f: Fiber) =>
		f.stateNode != null && !(f.stateNode instanceof Element),
};

export const op = {
	find(
		iter: Iterable<Fiber>,
		pred: (f: Fiber) => boolean,
	): Fiber | undefined {
		for (const f of iter) if (pred(f)) return f;
	},

	*filter(
		iter: Iterable<Fiber>,
		predicate: (f: Fiber) => boolean,
	): Generator<Fiber> {
		for (const f of iter) if (predicate(f)) yield f;
	},

	*map<T>(
		iter: Iterable<Fiber>,
		fn: (f: Fiber) => T,
	): Generator<T> {
		for (const f of iter) yield fn(f);
	},

	collect: (iter: Iterable<Fiber>): Fiber[] => Array.from(iter),

	findAncestorWithProp(
		fiber: Fiber,
		prop: string,
	): Fiber | undefined {
		return this.find(walkUp(fiber.return), filters.hasProp(prop));
	},

	getPropUp<T = unknown>(
		fiber: Fiber,
		prop: string,
	): T | undefined {
		return this.findAncestorWithProp(fiber, prop)?.pendingProps?.[prop] as
			| T
			| undefined;
	},

	findAll(fiber: Fiber, pred: (f: Fiber) => boolean): Fiber[] {
		return this.collect(this.filter(walkDown(fiber), pred));
	},

	findFirst(
		fiber: Fiber,
		pred: (f: Fiber) => boolean,
	): Fiber | undefined {
		return this.find(walkDown(fiber), pred);
	},

	getDOM(fiber: Fiber): Element | null {
		const f = this.find(
			walkDown(fiber),
			(f) => f.stateNode instanceof Element,
		);
		return (f?.stateNode as Element) ?? null;
	},

	/** extract props from all fibers with a given name across all roots */
	propsByName(
		roots: Iterable<{ current: Fiber }>,
		name: string,
	): unknown[] {
		const results: unknown[] = [];
		for (const root of roots) {
			for (
				const f of this.filter(walkDown(root.current), filters.named(name))
			) {
				results.push(f.pendingProps);
			}
		}
		return results;
	},
};
