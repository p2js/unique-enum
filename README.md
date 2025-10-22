# unique-enum

A runtime-safe alternative to typescript enums that maintains type safety and ergonomics.

```js
import { Enum } from "unique-enum";      // ESM
const { Enum } = require("unique-enum"); // CommonJS

const Direction = Enum(
    "North",
    "East",
    "South",
    "West"
);
```

## Installation

You can install unique-enum from [npm](https://npmjs.com/package/unique-enum):

```sh
npm install unique-enum
```

## Usage

An enum can be declared as in the first example. The `Enum` function returns a class with its members as its only possible instances. Its members will autocomplete like normal enum variants (eg. typing `Direction.` will show `North`, `East` etc. after declaration.) 

Each variant's string representation can be accessed using the `variant` property or by calling `toString`:

```js
console.log(Direction.North.variant) // prints: "North"
```

Enums also have convenient string representations and will work normally with `Object.keys`, iterators etc:

```js
console.log(Direction.toString()); 
// prints: Enum { North, East, South, West }
console.log(Object.keys(Direction)); 
// prints: [ "North", "East", "South", "West" ]

for(let direction of Direction) { /* iterates over the variants */ }
```

### Type Invariants

A unique enum `enum` has the following invariants for the lifetime of the program:

- Variants will only be equal to themselves and no other object or primitive.
- Variants are the sole objects for which `instanceof enum` will be true.
- After declaration, no new variants can be constructed or assigned, and variants cannot be changed or destroyed.

```js
new Direction("northwest");       // Error
Direction.NorthWest = {};         // Error
Direction.North = 0;              // Error
Direction.North.variant = "South" // Error
delete Direction.North;           // Error

function is_north(d) {
    return ( 
        d instanceof Direction    // Only true for the 4 Direction instances
        && d == Direction.North   // Only true for Direction.North
    );
}
```

These invariants make unique enums more resilient at runtime and when used from vanilla JavaScript.

### Debugging enum values

Unique enums maintaining type information at runtime also makes debugging easier compared to TypeScript's implementation.

```js
console.log(Direction.North) // prints: Value { variant: 'North' }
```

### Unique Enums + TypeScript

If you want to use variants of a specific enum as an object property or function argument, you can use the provided `Variant` type.

```ts
import { Variant } from "unique-enum";

function is_north(d: Variant<typeof Direction>) { return d == Direction.North; }

is_north(Direction.North); // true
is_north(Direction.South); // false
isNorth({}); // Error: Argument of type '{}' is not assignable to ...
```

Unfortunately, unlike TypeScript enums, unique enums cannot autofill `switch` statements at runtime, and hacks like a `default` arm that returns `never` will not work to check for exhaustiveness. This is because the type checker is unable to check for exhaustiveness of types that are not unions of literal types. This is the only ergonomic downside of unique enums.