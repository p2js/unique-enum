"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
