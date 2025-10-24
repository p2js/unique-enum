# Experimental unique-enum compiler

This is a replacement compiler for typescript source code that transforms typescript enums into modified `unique-enum` enums:

```ts
// source.ts
enum IP {
    V4,
    V6
}
```
```js
// source.js
const IP = ((() => {
    let construct_1 = true;
    class IP {
        static V4 = Object.freeze(new IP("V4"));
        static V6 = Object.freeze(new IP("V6"));
        constructor(variant) {
            if (!construct_1) {
                throw new Error("Cannot instantiate IP variants after initialisation");
            }
            this.variant = variant;
        }
        toString() {
            return `IP(${this.variant})`;
        }
    }
    construct_1 = false;
    return Object.freeze(IP);
})());
```

## Usage

Execute `compile/index.js` in the same directory as your project's `tsconfig` and it will compile the program like `tsc`, except transforming any enums as above.

If you want to modify the enum transformer, build the source file with
`npm run build`. There will be errors, but they do not affect functionality and can be ignored.

## Advantages

This compiler reuses typescript's enum syntax, fixing the biggest flaw in using unique enums in typescript: Overlapping variants can no longer be assigned to each other.

```ts
enum A { V4 };
let a: IP.V4 = A.V4 // Error
```

Additionally, since the enum transformer gets access to the class name, the class can be named after the enum, providing additional runtime debug information.

```ts
console.log(IP.V4); // IP { variant: 'V4' }
console.log(IP);    // [class IP] { V4: ..., V6: ...}
```

## Disadvantages

However, the type system still considers the enum variants as equivalent to their number literal types. This means the below code will still not error, and now has incorrect semantics:

```ts
let b: IP.V4 = 0; // Should error, but doesn't

if(b == IP.V4) {
    // TypeScript thinks this block will run, but it won't
} 
```

Because of this major disadvantage, it's recommended to just use standard unique enums, but this compiler exists as an alternative option.