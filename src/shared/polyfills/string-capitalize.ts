declare global {
  interface String {
    capitalize(locale?: string): string;
  }
}

if (!Object.getOwnPropertyDescriptor(String.prototype, "capitalize")) {
  Object.defineProperty(String.prototype, "capitalize", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function (this: string, locale?: string) {
      if (!this) return this;
      const [first, ...rest] = Array.from(this);
      return first.toLocaleUpperCase(locale) + rest.join("");
    },
  });
}

export {};
