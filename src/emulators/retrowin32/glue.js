let wasm;

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function getClampedArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ClampedArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedUint8ClampedArrayMemory0 = null;
function getUint8ClampedArrayMemory0() {
    if (cachedUint8ClampedArrayMemory0 === null || cachedUint8ClampedArrayMemory0.byteLength === 0) {
        cachedUint8ClampedArrayMemory0 = new Uint8ClampedArray(wasm.memory.buffer);
    }
    return cachedUint8ClampedArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

const CPUFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cpu_free(ptr >>> 0, 1));

const EmulatorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_emulator_free(ptr >>> 0, 1));

const FileOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_fileoptions_free(ptr >>> 0, 1));

const SurfaceOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_surfaceoptions_free(ptr >>> 0, 1));

export class CPU {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CPU.prototype);
        obj.__wbg_ptr = ptr;
        CPUFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CPUFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cpu_free(ptr, 0);
    }
    /**
     * @returns {Float64Array}
     */
    st() {
        const ret = wasm.cpu_st(this.__wbg_ptr);
        var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
        return v1;
    }
    /**
     * @returns {number}
     */
    get eip() {
        const ret = wasm.cpu_eip(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {Register} reg
     * @returns {number}
     */
    get(reg) {
        const ret = wasm.cpu_get(this.__wbg_ptr, reg);
        return ret >>> 0;
    }
    /**
     * @param {number} _eip
     */
    jmp(_eip) {
        wasm.cpu_jmp(this.__wbg_ptr, _eip);
    }
    /**
     * @param {Register} reg
     * @param {number} value
     */
    set(reg, value) {
        wasm.cpu_set(this.__wbg_ptr, reg, value);
    }
    /**
     * @returns {number}
     */
    flags() {
        const ret = wasm.cpu_flags(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    state() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.cpu_state(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    flags_str() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.cpu_flags_str(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) CPU.prototype[Symbol.dispose] = CPU.prototype.free;

export class Emulator {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Emulator.prototype);
        obj.__wbg_ptr = ptr;
        EmulatorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EmulatorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_emulator_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get instr_count() {
        const ret = wasm.emulator_instr_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    mappings_json() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.emulator_mappings_json(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {number} addr
     */
    breakpoint_add(addr) {
        wasm.emulator_breakpoint_add(this.__wbg_ptr, addr);
    }
    /**
     * @param {number} addr
     */
    breakpoint_clear(addr) {
        wasm.emulator_breakpoint_clear(this.__wbg_ptr, addr);
    }
    /**
     * @param {number} addr
     * @param {number} limit
     * @returns {string}
     */
    disassemble_json(addr, limit) {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.emulator_disassemble_json(this.__wbg_ptr, addr, limit);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string[]} dlls
     */
    set_external_dlls(dlls) {
        const ptr0 = passArrayJsValueToWasm0(dlls, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.emulator_set_external_dlls(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} scheme
     */
    set_tracing_scheme(scheme) {
        const ptr0 = passStringToWasm0(scheme, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.emulator_set_tracing_scheme(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {any[]}
     */
    direct_draw_surfaces() {
        const ret = wasm.emulator_direct_draw_surfaces(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {CPU}
     */
    cpu() {
        const ret = wasm.emulator_cpu(this.__wbg_ptr);
        return CPU.__wrap(ret);
    }
    /**
     * Run code until at least count instructions have run.
     * This exists to avoid many round-trips from JS to Rust in the execution loop.
     * @param {number} count
     * @returns {Status}
     */
    run(count) {
        const ret = wasm.emulator_run(this.__wbg_ptr, count);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * @returns {CPU[]}
     */
    cpus() {
        const ret = wasm.emulator_cpus(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string}
     */
    labels() {
        let deferred2_0;
        let deferred2_1;
        try {
            const ret = wasm.emulator_labels(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @returns {DataView}
     */
    memory() {
        const ret = wasm.emulator_memory(this.__wbg_ptr);
        return ret;
    }
    unblock() {
        wasm.emulator_unblock(this.__wbg_ptr);
    }
    /**
     * @returns {number}
     */
    get exit_code() {
        const ret = wasm.emulator_exit_code(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {string} cmdline
     * @param {boolean} relocate
     */
    start_exe(cmdline, relocate) {
        const ptr0 = passStringToWasm0(cmdline, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.emulator_start_exe(this.__wbg_ptr, ptr0, len0, relocate);
    }
}
if (Symbol.dispose) Emulator.prototype[Symbol.dispose] = Emulator.prototype.free;

export class FileOptions {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FileOptions.prototype);
        obj.__wbg_ptr = ptr;
        FileOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FileOptionsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_fileoptions_free(ptr, 0);
    }
    /**
     * Permit read access.
     * @returns {boolean}
     */
    get read() {
        const ret = wasm.__wbg_get_fileoptions_read(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Permit read access.
     * @param {boolean} arg0
     */
    set read(arg0) {
        wasm.__wbg_set_fileoptions_read(this.__wbg_ptr, arg0);
    }
    /**
     * Permit write access.
     * @returns {boolean}
     */
    get write() {
        const ret = wasm.__wbg_get_fileoptions_write(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Permit write access.
     * @param {boolean} arg0
     */
    set write(arg0) {
        wasm.__wbg_set_fileoptions_write(this.__wbg_ptr, arg0);
    }
    /**
     * Truncate the file to zero length.
     * @returns {boolean}
     */
    get truncate() {
        const ret = wasm.__wbg_get_fileoptions_truncate(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Truncate the file to zero length.
     * @param {boolean} arg0
     */
    set truncate(arg0) {
        wasm.__wbg_set_fileoptions_truncate(this.__wbg_ptr, arg0);
    }
    /**
     * Create the file if it doesn't exist.
     * @returns {boolean}
     */
    get create() {
        const ret = wasm.__wbg_get_fileoptions_create(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Create the file if it doesn't exist.
     * @param {boolean} arg0
     */
    set create(arg0) {
        wasm.__wbg_set_fileoptions_create(this.__wbg_ptr, arg0);
    }
    /**
     * Create the file if it doesn't exist, and fail if it does.
     * @returns {boolean}
     */
    get create_new() {
        const ret = wasm.__wbg_get_fileoptions_create_new(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Create the file if it doesn't exist, and fail if it does.
     * @param {boolean} arg0
     */
    set create_new(arg0) {
        wasm.__wbg_set_fileoptions_create_new(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) FileOptions.prototype[Symbol.dispose] = FileOptions.prototype.free;

/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13}
 */
export const Register = Object.freeze({
    EAX: 0, "0": "EAX",
    ECX: 1, "1": "ECX",
    EDX: 2, "2": "EDX",
    EBX: 3, "3": "EBX",
    ESP: 4, "4": "ESP",
    EBP: 5, "5": "EBP",
    ESI: 6, "6": "ESI",
    EDI: 7, "7": "EDI",
    CS: 8, "8": "CS",
    DS: 9, "9": "DS",
    ES: 10, "10": "ES",
    FS: 11, "11": "FS",
    GS: 12, "12": "GS",
    SS: 13, "13": "SS",
});

/**
 * @enum {0 | 1 | 2 | 3 | 4}
 */
export const Status = Object.freeze({
    Running: 0, "0": "Running",
    Blocked: 1, "1": "Blocked",
    Error: 2, "2": "Error",
    DebugBreak: 3, "3": "DebugBreak",
    Exit: 4, "4": "Exit",
});

export class SurfaceOptions {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SurfaceOptionsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_surfaceoptions_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get width() {
        const ret = wasm.__wbg_get_surfaceoptions_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set width(arg0) {
        wasm.__wbg_set_surfaceoptions_width(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get height() {
        const ret = wasm.__wbg_get_surfaceoptions_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set height(arg0) {
        wasm.__wbg_set_surfaceoptions_height(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get bytes_per_pixel() {
        const ret = wasm.__wbg_get_surfaceoptions_bytes_per_pixel(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set bytes_per_pixel(arg0) {
        wasm.__wbg_set_surfaceoptions_bytes_per_pixel(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get primary() {
        const ret = wasm.__wbg_get_surfaceoptions_primary(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set primary(arg0) {
        wasm.__wbg_set_surfaceoptions_primary(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) SurfaceOptions.prototype[Symbol.dispose] = SurfaceOptions.prototype.free;

/**
 * @param {JsHost} host
 * @returns {Emulator}
 */
export function new_emulator(host) {
    const ret = wasm.new_emulator(host);
    return Emulator.__wrap(ret);
}

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_Error_52673b7de5a0ca89 = function(arg0, arg1) {
        const ret = Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg___wbindgen_debug_string_adfb662ae34724b6 = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_memory_a342e963fbcabd68 = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_number_get_9619185a74197f95 = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg___wbindgen_string_get_a2a31e16edf96e42 = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_buffer_ef9774282e5dab94 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_button_cf393fc0a7773ee4 = function(arg0) {
        const ret = arg0.button;
        return ret;
    };
    imports.wbg.__wbg_byteLength_249a2b65c8315d45 = function(arg0) {
        const ret = arg0.byteLength;
        return ret;
    };
    imports.wbg.__wbg_call_0ad083564791763a = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_cpu_new = function(arg0) {
        const ret = CPU.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_createElement_32c287e69e603e7e = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.createElement(getStringFromWasm0(arg1, arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_create_window_3c59f235d130d69a = function(arg0, arg1) {
        const ret = arg0.create_window(arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_document_da63b92bac45c6f9 = function(arg0) {
        const ret = arg0.document;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_drawImage_56d0362a2474b155 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        arg0.drawImage(arg1, arg2, arg3);
    }, arguments) };
    imports.wbg.__wbg_drawImage_e16238d34587498a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg0.drawImage(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
    }, arguments) };
    imports.wbg.__wbg_ensure_timer_d192fc71e0069e4a = function(arg0, arg1) {
        arg0.ensure_timer(arg1 >>> 0);
    };
    imports.wbg.__wbg_fillRect_7d2354e03f9acc1b = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.fillRect(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_fill_749b17bf30be9bd4 = function(arg0) {
        arg0.fill();
    };
    imports.wbg.__wbg_fullscreen_734e672975253adb = function(arg0) {
        arg0.fullscreen();
    };
    imports.wbg.__wbg_getContext_38bc848653a9260d = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_getTime_6953b8a865af729b = function(arg0) {
        const ret = arg0.getTime();
        return ret;
    };
    imports.wbg.__wbg_getTimezoneOffset_6c191e41297e5a8e = function(arg0) {
        const ret = arg0.getTimezoneOffset();
        return ret;
    };
    imports.wbg.__wbg_get_b996a12be035ef4f = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_event_9dd132ea460aa2b8 = function(arg0) {
        const ret = arg0.get_event();
        return ret;
    };
    imports.wbg.__wbg_globalThis_6b4d52a0b6aaeaea = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_global_49324ce12193de77 = function() { return handleError(function () {
        const ret = global.global;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_info_ca82e3edf9318954 = function(arg0) {
        const ret = arg0.info();
        return ret;
    };
    imports.wbg.__wbg_instanceof_CanvasRenderingContext2d_d22916fed004e2fd = function(arg0) {
        let result;
        try {
            result = arg0 instanceof CanvasRenderingContext2D;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Error_0c9a394fe7dece82 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Error;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Window_311934805c10047c = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_log_940ce50a15c940eb = function(arg0, arg1, arg2, arg3) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg2;
            deferred0_1 = arg3;
            arg0.log(arg1, getStringFromWasm0(arg2, arg3));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_new_0_fe1554a5ea9b2468 = function() {
        const ret = new Date();
        return ret;
    };
    imports.wbg.__wbg_new_442a01c340625e5e = function(arg0, arg1, arg2) {
        const ret = new DataView(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_a96f21efc59c18b1 = function(arg0) {
        const ret = new Date(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_no_args_a136448eeb7d48ac = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_with_u8_clamped_array_910aa121ffd52a07 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new ImageData(getClampedArrayU8FromWasm0(arg0, arg1), arg2 >>> 0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_now_c893509b6d04fa0d = function(arg0) {
        const ret = arg0.now();
        return ret;
    };
    imports.wbg.__wbg_offsetX_735d4365b41503ea = function(arg0) {
        const ret = arg0.offsetX;
        return ret;
    };
    imports.wbg.__wbg_offsetY_b425bca937dc0468 = function(arg0) {
        const ret = arg0.offsetY;
        return ret;
    };
    imports.wbg.__wbg_open_4dc4b1c09dba3cf1 = function(arg0, arg1, arg2, arg3) {
        const ret = arg0.open(getStringFromWasm0(arg1, arg2), FileOptions.__wrap(arg3));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_parse_bd09af51fd7dd576 = function() { return handleError(function (arg0, arg1) {
        const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_performance_69882c3bda965f91 = function(arg0) {
        const ret = arg0.performance;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_putImageData_2975334e27e89cd1 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        arg0.putImageData(arg1, arg2, arg3);
    }, arguments) };
    imports.wbg.__wbg_read_b4e07abd16138ad5 = function(arg0, arg1, arg2) {
        const ret = arg0.read(getArrayU8FromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_screen_8fef59ecec61fb1a = function(arg0) {
        const ret = arg0.screen();
        return ret;
    };
    imports.wbg.__wbg_seek_d1203db79d6a79bc = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.seek(arg1 >>> 0, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_self_cca3ca60d61220f4 = function() { return handleError(function () {
        const ret = self.self;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_1b50d2de855a9d50 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_fillStyle_6f04c056479ad5af = function(arg0, arg1) {
        arg0.fillStyle = arg1;
    };
    imports.wbg.__wbg_set_height_7c3abb4af2d2235c = function(arg0, arg1) {
        arg0.height = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_size_69c5da9f4bea38e4 = function(arg0, arg1, arg2) {
        arg0.set_size(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_set_title_4ba80651bda87b98 = function(arg0, arg1, arg2) {
        arg0.title = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_width_d0f5a718234657d4 = function(arg0, arg1) {
        arg0.width = arg1 >>> 0;
    };
    imports.wbg.__wbg_stdout_2209f8bdad555948 = function(arg0, arg1, arg2) {
        arg0.stdout(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_timeStamp_22d8d02d9f717b67 = function(arg0) {
        const ret = arg0.timeStamp;
        return ret;
    };
    imports.wbg.__wbg_toString_5eb859e9871e175f = function(arg0) {
        const ret = arg0.toString();
        return ret;
    };
    imports.wbg.__wbg_type_b9c6dd303f337332 = function(arg0, arg1) {
        const ret = arg1.type;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_win32_trace_89addc75a0d7fc56 = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.win32_trace(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_window_2aba046d3fc4ad7c = function() { return handleError(function () {
        const ret = window.window;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_write_2e76d74dfab19e1e = function(arg0, arg1, arg2) {
        const ret = arg0.write(getArrayU8FromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
        // Cast intrinsic for `F64 -> Externref`.
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_externrefs;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    cachedUint8ClampedArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('glue_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
