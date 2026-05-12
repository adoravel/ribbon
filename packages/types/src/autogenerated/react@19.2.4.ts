// source refs:
// - packages/react-reconciler/src/ReactWorkTags.js
// - packages/react-reconciler/src/ReactFiberFlags.js
// - packages/shared/ReactSymbols.js
// auto-generated for react v19.2.4

export const $$memo = Symbol.for("react.memo");
export const $$forwardRef = Symbol.for("react.forward_ref");
export const $$fragment = Symbol.for("react.fragment");
export const $$provider = Symbol.for("react.provider");
export const $$context = Symbol.for("react.context");
export const $$lazy = Symbol.for("react.lazy");

export const FunctionComponent = 0;
export const ClassComponent = 1;
export const HostRoot = 3;
export const HostPortal = 4;
export const HostComponent = 5;
export const HostText = 6;
export const Fragment = 7;
export const Mode = 8;
export const ContextConsumer = 9;
export const ContextProvider = 10;
export const ForwardRef = 11;
export const Profiler = 12;
export const SuspenseComponent = 13;
export const MemoComponent = 14;
export const SimpleMemoComponent = 15;
export const LazyComponent = 16;
export const IncompleteClassComponent = 17;
export const DehydratedFragment = 18;
export const SuspenseListComponent = 19;
export const ScopeComponent = 21;
export const OffscreenComponent = 22;
export const LegacyHiddenComponent = 23;
export const CacheComponent = 24;
export const TracingMarkerComponent = 25;
export const HostHoistable = 26;
export const HostSingleton = 27;
export const IncompleteFunctionComponent = 28;
export const Throw = 29;
export const ViewTransitionComponent = 30;
export const ActivityComponent = 31;

// fiber.tag is one of these integers
export const WorkTags = Object.freeze(
	{
		FunctionComponent, ClassComponent, HostRoot, HostPortal, HostComponent, HostText, Fragment, Mode, ContextConsumer, ContextProvider, ForwardRef, Profiler, SuspenseComponent, MemoComponent, SimpleMemoComponent, LazyComponent, IncompleteClassComponent, DehydratedFragment, SuspenseListComponent, ScopeComponent, OffscreenComponent, LegacyHiddenComponent, CacheComponent, TracingMarkerComponent, HostHoistable, HostSingleton, IncompleteFunctionComponent, Throw, ViewTransitionComponent, ActivityComponent
	} as const,
);

export type WorkTag = typeof WorkTags[keyof typeof WorkTags];

export const TagName: Readonly<Record<number, string>> = Object.fromEntries(
	Object.entries(WorkTags).map(([k, v]) => [v, k]),
);

export const NoFlags = 0b0000000000000000000000000000000;
export const PerformedWork = 0b0000000000000000000000000000001;
export const Placement = 0b0000000000000000000000000000010;
export const DidCapture = 0b0000000000000000000000010000000;
export const Hydrating = 0b0000000000000000001000000000000;
export const Update = 0b0000000000000000000000000000100;
export const Cloned = 0b0000000000000000000000000001000;
export const ChildDeletion = 0b0000000000000000000000000010000;
export const ContentReset = 0b0000000000000000000000000100000;
export const Callback = 0b0000000000000000000000001000000;
export const ForceClientRender = 0b0000000000000000000000100000000;
export const Ref = 0b0000000000000000000001000000000;
export const Snapshot = 0b0000000000000000000010000000000;
export const Passive = 0b0000000000000000000100000000000;
export const Visibility = 0b0000000000000000010000000000000;
export const StoreConsistency = 0b0000000000000000100000000000000;
export const Hydrate = Callback;
export const ScheduleRetry = StoreConsistency;
export const ShouldSuspendCommit = Visibility;
export const ViewTransitionNamedMount = ShouldSuspendCommit;
export const DidDefer = ContentReset;
export const FormReset = Snapshot;
export const AffectedParentLayout = ContentReset;
export const LifecycleEffectMask = Passive | Update | Callback | Ref | Snapshot | StoreConsistency;

// union of all commit flags (flags with the lifetime of a particular commit)
export const HostEffectMask = 0b0000000000000000111111111111111;

export const Incomplete = 0b0000000000000001000000000000000;
export const ShouldCapture = 0b0000000000000010000000000000000;
export const ForceUpdateForLegacySuspense = 0b0000000000000100000000000000000;
export const DidPropagateContext = 0b0000000000001000000000000000000;
export const NeedsPropagation = 0b0000000000010000000000000000000;
export const Forked = 0b0000000000100000000000000000000;
export const SnapshotStatic = 0b0000000001000000000000000000000;
export const LayoutStatic = 0b0000000010000000000000000000000;
export const RefStatic = LayoutStatic;
export const PassiveStatic = 0b0000000100000000000000000000000;
export const MaySuspendCommit = 0b0000001000000000000000000000000;
export const ViewTransitionNamedStatic = SnapshotStatic | MaySuspendCommit;
export const ViewTransitionStatic = 0b0000010000000000000000000000000;
export const PlacementDEV = 0b0000100000000000000000000000000;
export const MountLayoutDev = 0b0001000000000000000000000000000;
export const MountPassiveDev = 0b0010000000000000000000000000000;

// commit-phase traversal masks that React uses internally to decide
// whether to enter each sub-phase
export const MutationMask = Placement | Update | ChildDeletion | ContentReset | Ref | Hydrating | Visibility | FormReset;

export const LayoutMask = Update | Callback | Ref | Visibility;
export const PassiveMask = Passive | Visibility | ChildDeletion;
export const StaticMask = LayoutStatic | PassiveStatic | RefStatic | MaySuspendCommit | ViewTransitionStatic | ViewTransitionNamedStatic;

// exact bit values from ReactFiberFlags.js @ v19.2.4.
export const EffectFlags = Object.freeze(
	{
		NoFlags, PerformedWork, Placement, DidCapture, Hydrating, Update, Cloned, ChildDeletion, ContentReset, Callback, ForceClientRender, Ref, Snapshot, Passive, Visibility, StoreConsistency, Hydrate, ScheduleRetry, ShouldSuspendCommit, ViewTransitionNamedMount, DidDefer, FormReset, AffectedParentLayout, LifecycleEffectMask, HostEffectMask, Incomplete, ShouldCapture, ForceUpdateForLegacySuspense, DidPropagateContext, NeedsPropagation, Forked, SnapshotStatic, LayoutStatic, RefStatic, PassiveStatic, MaySuspendCommit, ViewTransitionNamedStatic, ViewTransitionStatic, PlacementDEV, MountLayoutDev, MountPassiveDev, MutationMask, LayoutMask, PassiveMask, StaticMask
	} as const,
);

export const BeforeMutationMask: number = Snapshot | 0;

export const SUBTREE_MASK: number = BeforeMutationMask | MutationMask | LayoutMask | PassiveMask;
