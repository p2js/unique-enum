/**
 * Defines a type and runtime-safe enum type with unique variants.
 * 
 * ```js
 * const Direction = Enum(
 *     "North",
 *     "East",
 *     "South",
 *     "West"
 * ); // Direction.North etc. will be autocompleted and type-safe!
 * ```
 * 
 * @param variants Variant names
 * @returns an enum class with variants as members
 */
export function Enum<T extends string>(...variants: T[]) {
    let construct = true;
    class Value<V extends T = T> {
        private constructor(readonly variant: V) {
            if (!construct) throw Error('Cannot instantiate Enum variants after initlialisation');
        }
        toString() {
            return this.variant;
        }
        static toString() {
            return `Enum { ${variants.join(', ')} }`;
        }
        static [Symbol.iterator]() {
            return Object.values(this)[Symbol.iterator]();
        }
    }
    for (const variant of variants) {
        (Value as any)[variant] = Object.freeze(new (Value as any)(variant));
    }
    construct = false;
    type Enum = { readonly [V in T]: Value<V> };
    return Object.freeze(Value as Enum);
}
/**
 * Type representing the variants of an `Enum`.
 * 
 * ```ts
 * const Direction = Enum("N", "E", "S", "W");
 * 
 * function isNorth(d: Variant<typeof Direction>) {
 *     return d == Direction.N;
 * };
 * 
 * isNorth(Direction.N);
 * isNorth({}); // Error: Argument of type '{}' is not assignable to ...
 * ```
 */
export type Variant<E extends Record<string, any>> = E[keyof E];