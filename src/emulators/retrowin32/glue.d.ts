/* tslint:disable */
/* eslint-disable */

export interface JsWindow {
  title: string;
  set_size(width: number, height: number): void;
}


export interface JsFile {
    info(): number;
    seek(from: number, ofs: number): number;
    read(buf: Uint8Array): number;
    write(buf: Uint8Array): number;
}


export interface JsHost {
  log(level: number, msg: string): void;
  win32_trace(contest: string, msg: string): void;

  ensure_timer(when: number): void;
  get_event(): Event | undefined;
  
  open(path: string, access: FileOptions): JsFile|null;
  stdout(buf: Uint8Array): void;
  
  create_window(hwnd: number): JsWindow;
  screen(): CanvasRenderingContext2D;
  audio(buf: Int16Array): void;
}


export type SurfaceDebug = DirectDrawSurfaceMeta & { canvas: HTMLCanvasElement };


export interface DirectDrawSurfaceMeta {
    ptr: number;
    width: number;
    height: number;
    bytes_per_pixel: number;
    primary: boolean;
    pixels: number | null;
    palette: number | null;
}

export interface Instruction {
    addr: number;
    bytes: string;
    code: CodePart[];
    ops: string[];
}

export interface CodePart {
    kind: string;
    text: string;
}

export interface Mapping {
    addr: number;
    size: number;
    module: string | null;
    desc: string;
    flags: IMAGE_SCN;
}


export class CPU {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  st(): Float64Array;
  get(reg: Register): number;
  jmp(_eip: number): void;
  set(reg: Register, value: number): void;
  flags(): number;
  state(): string;
  flags_str(): string;
  readonly eip: number;
}

export class Emulator {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  mappings_json(): string;
  breakpoint_add(addr: number): void;
  breakpoint_clear(addr: number): void;
  disassemble_json(addr: number, limit: number): string;
  set_external_dlls(dlls: string[]): void;
  set_tracing_scheme(scheme: string): void;
  direct_draw_surfaces(): any[];
  cpu(): CPU;
  /**
   * Run code until at least count instructions have run.
   * This exists to avoid many round-trips from JS to Rust in the execution loop.
   */
  run(count: number): Status;
  cpus(): CPU[];
  labels(): string;
  memory(): DataView;
  unblock(): void;
  start_exe(cmdline: string, relocate: boolean): void;
  readonly instr_count: number;
  readonly exit_code: number;
}

export class FileOptions {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Permit read access.
   */
  read: boolean;
  /**
   * Permit write access.
   */
  write: boolean;
  /**
   * Truncate the file to zero length.
   */
  truncate: boolean;
  /**
   * Create the file if it doesn't exist.
   */
  create: boolean;
  /**
   * Create the file if it doesn't exist, and fail if it does.
   */
  create_new: boolean;
}

export enum Register {
  EAX = 0,
  ECX = 1,
  EDX = 2,
  EBX = 3,
  ESP = 4,
  EBP = 5,
  ESI = 6,
  EDI = 7,
  CS = 8,
  DS = 9,
  ES = 10,
  FS = 11,
  GS = 12,
  SS = 13,
}

export enum Status {
  Running = 0,
  Blocked = 1,
  Error = 2,
  DebugBreak = 3,
  Exit = 4,
}

export class SurfaceOptions {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  width: number;
  height: number;
  bytes_per_pixel: number;
  primary: boolean;
}

export function new_emulator(host: JsHost): Emulator;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_emulator_free: (a: number, b: number) => void;
  readonly emulator_breakpoint_add: (a: number, b: number) => void;
  readonly emulator_breakpoint_clear: (a: number, b: number) => void;
  readonly emulator_cpu: (a: number) => number;
  readonly emulator_cpus: (a: number) => [number, number];
  readonly emulator_direct_draw_surfaces: (a: number) => [number, number];
  readonly emulator_disassemble_json: (a: number, b: number, c: number) => [number, number];
  readonly emulator_exit_code: (a: number) => number;
  readonly emulator_instr_count: (a: number) => number;
  readonly emulator_labels: (a: number) => [number, number, number, number];
  readonly emulator_mappings_json: (a: number) => [number, number];
  readonly emulator_memory: (a: number) => any;
  readonly emulator_run: (a: number, b: number) => [number, number, number];
  readonly emulator_set_external_dlls: (a: number, b: number, c: number) => void;
  readonly emulator_set_tracing_scheme: (a: number, b: number, c: number) => void;
  readonly emulator_start_exe: (a: number, b: number, c: number, d: number) => void;
  readonly emulator_unblock: (a: number) => void;
  readonly new_emulator: (a: any) => number;
  readonly __wbg_cpu_free: (a: number, b: number) => void;
  readonly cpu_eip: (a: number) => number;
  readonly cpu_flags: (a: number) => number;
  readonly cpu_flags_str: (a: number) => [number, number];
  readonly cpu_get: (a: number, b: number) => number;
  readonly cpu_jmp: (a: number, b: number) => void;
  readonly cpu_set: (a: number, b: number, c: number) => void;
  readonly cpu_st: (a: number) => [number, number];
  readonly cpu_state: (a: number) => [number, number];
  readonly __wbg_fileoptions_free: (a: number, b: number) => void;
  readonly __wbg_get_fileoptions_create: (a: number) => number;
  readonly __wbg_get_fileoptions_create_new: (a: number) => number;
  readonly __wbg_get_fileoptions_read: (a: number) => number;
  readonly __wbg_get_fileoptions_truncate: (a: number) => number;
  readonly __wbg_get_fileoptions_write: (a: number) => number;
  readonly __wbg_get_surfaceoptions_bytes_per_pixel: (a: number) => number;
  readonly __wbg_get_surfaceoptions_height: (a: number) => number;
  readonly __wbg_get_surfaceoptions_primary: (a: number) => number;
  readonly __wbg_get_surfaceoptions_width: (a: number) => number;
  readonly __wbg_set_fileoptions_create: (a: number, b: number) => void;
  readonly __wbg_set_fileoptions_create_new: (a: number, b: number) => void;
  readonly __wbg_set_fileoptions_read: (a: number, b: number) => void;
  readonly __wbg_set_fileoptions_truncate: (a: number, b: number) => void;
  readonly __wbg_set_fileoptions_write: (a: number, b: number) => void;
  readonly __wbg_set_surfaceoptions_bytes_per_pixel: (a: number, b: number) => void;
  readonly __wbg_set_surfaceoptions_height: (a: number, b: number) => void;
  readonly __wbg_set_surfaceoptions_primary: (a: number, b: number) => void;
  readonly __wbg_set_surfaceoptions_width: (a: number, b: number) => void;
  readonly __wbg_surfaceoptions_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
