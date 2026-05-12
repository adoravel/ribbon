type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Numeric<T extends string> = T extends Digit
	? (T extends `${infer N extends number}` ? N : never)
	: never;

type StrictIdentifier<S extends string> = S extends "" ? never
	: S extends `${number}` ? Numeric<S>
	: S extends `${string} ${string}` ? never
	: S;

type BuildIdentifier<S extends string> = S extends "" ? never
	: S extends `${string} ${string}` ? never
	: S;

type SplitPreIdentifiers<S extends string, Separator extends string> = S extends
	`${infer Head}${Separator}${infer Tail}`
	? (StrictIdentifier<Head> extends never ? never
		: SplitPreIdentifiers<Tail, Separator>)
	: StrictIdentifier<S>;

type SplitBuildIdentifiers<S extends string, Separator extends string> =
	S extends `${infer Head}${Separator}${infer Tail}`
		? BuildIdentifier<Head> extends never ? never
		: SplitBuildIdentifiers<Tail, Separator>
		: BuildIdentifier<S>;

type ParseSemverCore<S extends string> = S extends
	`${infer Major}.${infer Minor}.${infer Patch}`
	? Numeric<Major> extends never ? never
	: Numeric<Minor> extends never ? never
	: Numeric<Patch> extends never ? never
	: { major: Major; minor: Minor; patch: Patch }
	: never;

type ParseSemverBase<S extends string, BuildMeta extends { build?: string }> =
	S extends `${infer Core}-${infer Pre}` ? Pre extends "" ? never
		: SplitPreIdentifiers<Pre, "."> extends never ? never
		: ParseSemverCore<Core> extends never ? never
		: BuildMeta["build"] extends string
			? { core: ParseSemverCore<Core>; pre: Pre; build: BuildMeta["build"] }
		: { core: ParseSemverCore<Core>; pre: Pre; build?: undefined }
		: ParseSemverCore<S> extends never ? never
		: BuildMeta["build"] extends string
			? { core: ParseSemverCore<S>; pre?: undefined; build: BuildMeta["build"] }
		: { core: ParseSemverCore<S>; pre?: undefined; build?: undefined };

export type ParseSemver<V extends string> = V extends
	`${infer Base}+${infer Build}` ? Build extends "" ? never
	: SplitBuildIdentifiers<Build, "."> extends never ? never
	: ParseSemverBase<Base, { build: Build }>
	: ParseSemverBase<V, { build?: never }>;

export type IsSemver<V extends string> = ParseSemver<V> extends never ? false
	: true;

export type Semver<V extends string> = V & IsSemver<V>;
