export const define = (
	target: object,
	key: PropertyKey,
	attributes: PropertyDescriptor,
) => {
	if (Object.hasOwn(attributes, "value")) {
		attributes.writable = true;
	}
	Reflect.defineProperty(target, key, {
		configurable: true,
		enumerable: true,
		...attributes,
	});
	return () => Reflect.deleteProperty(target, key);
};
