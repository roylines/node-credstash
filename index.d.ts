export = Credstash;

declare class Credstash {
  list(options: Credstash.IOptions, callback: Credstash.Callback<string[]>): void;
  list(callback: Credstash.Callback<string[]>): void;

  get(value: string, options: Credstash.IOptions, callback: Credstash.Callback<string>): void;
  get(value: string, callback: Credstash.Callback<string>): void;
}

declare namespace Credstash {
  type Callback<T> = (err: Error | null, response: T) => void;

  interface IOptions {
    limit?: number,
    region?: string,
    table?: string
  }
}