// 临时类型声明，避免构建错误
declare module 'bs58' {
  export function encode(data: Uint8Array | number[]): string;
  export function decode(data: string): Uint8Array;
}
