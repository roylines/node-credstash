export = Credstash;

declare class Credstash {
  public list(options: Credstash.IConfig, callback: Credstash.Callback<string[]>): void;
  public get(value: string, options: Credstash.IConfig, callback: Credstash.Callback<string>): void;
}

declare namespace Credstash {
  type Callback<T> = (err: Error | null, response: T) => void;

  interface IConfig {
    limit?: number,
    region?: string,
    table?: string
  };
}