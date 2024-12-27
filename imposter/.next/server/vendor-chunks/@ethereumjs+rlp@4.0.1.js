"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@ethereumjs+rlp@4.0.1";
exports.ids = ["vendor-chunks/@ethereumjs+rlp@4.0.1"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@ethereumjs+rlp@4.0.1/node_modules/@ethereumjs/rlp/dist/index.js":
/*!*********************************************************************************************!*\
  !*** ./node_modules/.pnpm/@ethereumjs+rlp@4.0.1/node_modules/@ethereumjs/rlp/dist/index.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.RLP = exports.utils = exports.decode = exports.encode = void 0;\n/**\n * RLP Encoding based on https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/\n * This function takes in data, converts it to Uint8Array if not,\n * and adds a length for recursion.\n * @param input Will be converted to Uint8Array\n * @returns Uint8Array of encoded data\n **/\nfunction encode(input) {\n    if (Array.isArray(input)) {\n        const output = [];\n        let outputLength = 0;\n        for (let i = 0; i < input.length; i++) {\n            const encoded = encode(input[i]);\n            output.push(encoded);\n            outputLength += encoded.length;\n        }\n        return concatBytes(encodeLength(outputLength, 192), ...output);\n    }\n    const inputBuf = toBytes(input);\n    if (inputBuf.length === 1 && inputBuf[0] < 128) {\n        return inputBuf;\n    }\n    return concatBytes(encodeLength(inputBuf.length, 128), inputBuf);\n}\nexports.encode = encode;\n/**\n * Slices a Uint8Array, throws if the slice goes out-of-bounds of the Uint8Array.\n * E.g. `safeSlice(hexToBytes('aa'), 1, 2)` will throw.\n * @param input\n * @param start\n * @param end\n */\nfunction safeSlice(input, start, end) {\n    if (end > input.length) {\n        throw new Error('invalid RLP (safeSlice): end slice of Uint8Array out-of-bounds');\n    }\n    return input.slice(start, end);\n}\n/**\n * Parse integers. Check if there is no leading zeros\n * @param v The value to parse\n */\nfunction decodeLength(v) {\n    if (v[0] === 0) {\n        throw new Error('invalid RLP: extra zeros');\n    }\n    return parseHexByte(bytesToHex(v));\n}\nfunction encodeLength(len, offset) {\n    if (len < 56) {\n        return Uint8Array.from([len + offset]);\n    }\n    const hexLength = numberToHex(len);\n    const lLength = hexLength.length / 2;\n    const firstByte = numberToHex(offset + 55 + lLength);\n    return Uint8Array.from(hexToBytes(firstByte + hexLength));\n}\nfunction decode(input, stream = false) {\n    if (typeof input === 'undefined' || input === null || input.length === 0) {\n        return Uint8Array.from([]);\n    }\n    const inputBytes = toBytes(input);\n    const decoded = _decode(inputBytes);\n    if (stream) {\n        return decoded;\n    }\n    if (decoded.remainder.length !== 0) {\n        throw new Error('invalid RLP: remainder must be zero');\n    }\n    return decoded.data;\n}\nexports.decode = decode;\n/** Decode an input with RLP */\nfunction _decode(input) {\n    let length, llength, data, innerRemainder, d;\n    const decoded = [];\n    const firstByte = input[0];\n    if (firstByte <= 0x7f) {\n        // a single byte whose value is in the [0x00, 0x7f] range, that byte is its own RLP encoding.\n        return {\n            data: input.slice(0, 1),\n            remainder: input.slice(1),\n        };\n    }\n    else if (firstByte <= 0xb7) {\n        // string is 0-55 bytes long. A single byte with value 0x80 plus the length of the string followed by the string\n        // The range of the first byte is [0x80, 0xb7]\n        length = firstByte - 0x7f;\n        // set 0x80 null to 0\n        if (firstByte === 0x80) {\n            data = Uint8Array.from([]);\n        }\n        else {\n            data = safeSlice(input, 1, length);\n        }\n        if (length === 2 && data[0] < 0x80) {\n            throw new Error('invalid RLP encoding: invalid prefix, single byte < 0x80 are not prefixed');\n        }\n        return {\n            data,\n            remainder: input.slice(length),\n        };\n    }\n    else if (firstByte <= 0xbf) {\n        // string is greater than 55 bytes long. A single byte with the value (0xb7 plus the length of the length),\n        // followed by the length, followed by the string\n        llength = firstByte - 0xb6;\n        if (input.length - 1 < llength) {\n            throw new Error('invalid RLP: not enough bytes for string length');\n        }\n        length = decodeLength(safeSlice(input, 1, llength));\n        if (length <= 55) {\n            throw new Error('invalid RLP: expected string length to be greater than 55');\n        }\n        data = safeSlice(input, llength, length + llength);\n        return {\n            data,\n            remainder: input.slice(length + llength),\n        };\n    }\n    else if (firstByte <= 0xf7) {\n        // a list between 0-55 bytes long\n        length = firstByte - 0xbf;\n        innerRemainder = safeSlice(input, 1, length);\n        while (innerRemainder.length) {\n            d = _decode(innerRemainder);\n            decoded.push(d.data);\n            innerRemainder = d.remainder;\n        }\n        return {\n            data: decoded,\n            remainder: input.slice(length),\n        };\n    }\n    else {\n        // a list over 55 bytes long\n        llength = firstByte - 0xf6;\n        length = decodeLength(safeSlice(input, 1, llength));\n        if (length < 56) {\n            throw new Error('invalid RLP: encoded list too short');\n        }\n        const totalLength = llength + length;\n        if (totalLength > input.length) {\n            throw new Error('invalid RLP: total length is larger than the data');\n        }\n        innerRemainder = safeSlice(input, llength, totalLength);\n        while (innerRemainder.length) {\n            d = _decode(innerRemainder);\n            decoded.push(d.data);\n            innerRemainder = d.remainder;\n        }\n        return {\n            data: decoded,\n            remainder: input.slice(totalLength),\n        };\n    }\n}\nconst cachedHexes = Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, '0'));\nfunction bytesToHex(uint8a) {\n    // Pre-caching chars with `cachedHexes` speeds this up 6x\n    let hex = '';\n    for (let i = 0; i < uint8a.length; i++) {\n        hex += cachedHexes[uint8a[i]];\n    }\n    return hex;\n}\nfunction parseHexByte(hexByte) {\n    const byte = Number.parseInt(hexByte, 16);\n    if (Number.isNaN(byte))\n        throw new Error('Invalid byte sequence');\n    return byte;\n}\n// Caching slows it down 2-3x\nfunction hexToBytes(hex) {\n    if (typeof hex !== 'string') {\n        throw new TypeError('hexToBytes: expected string, got ' + typeof hex);\n    }\n    if (hex.length % 2)\n        throw new Error('hexToBytes: received invalid unpadded hex');\n    const array = new Uint8Array(hex.length / 2);\n    for (let i = 0; i < array.length; i++) {\n        const j = i * 2;\n        array[i] = parseHexByte(hex.slice(j, j + 2));\n    }\n    return array;\n}\n/** Concatenates two Uint8Arrays into one. */\nfunction concatBytes(...arrays) {\n    if (arrays.length === 1)\n        return arrays[0];\n    const length = arrays.reduce((a, arr) => a + arr.length, 0);\n    const result = new Uint8Array(length);\n    for (let i = 0, pad = 0; i < arrays.length; i++) {\n        const arr = arrays[i];\n        result.set(arr, pad);\n        pad += arr.length;\n    }\n    return result;\n}\nfunction utf8ToBytes(utf) {\n    return new TextEncoder().encode(utf);\n}\n/** Transform an integer into its hexadecimal value */\nfunction numberToHex(integer) {\n    if (integer < 0) {\n        throw new Error('Invalid integer as argument, must be unsigned!');\n    }\n    const hex = integer.toString(16);\n    return hex.length % 2 ? `0${hex}` : hex;\n}\n/** Pad a string to be even */\nfunction padToEven(a) {\n    return a.length % 2 ? `0${a}` : a;\n}\n/** Check if a string is prefixed by 0x */\nfunction isHexPrefixed(str) {\n    return str.length >= 2 && str[0] === '0' && str[1] === 'x';\n}\n/** Removes 0x from a given String */\nfunction stripHexPrefix(str) {\n    if (typeof str !== 'string') {\n        return str;\n    }\n    return isHexPrefixed(str) ? str.slice(2) : str;\n}\n/** Transform anything into a Uint8Array */\nfunction toBytes(v) {\n    if (v instanceof Uint8Array) {\n        return v;\n    }\n    if (typeof v === 'string') {\n        if (isHexPrefixed(v)) {\n            return hexToBytes(padToEven(stripHexPrefix(v)));\n        }\n        return utf8ToBytes(v);\n    }\n    if (typeof v === 'number' || typeof v === 'bigint') {\n        if (!v) {\n            return Uint8Array.from([]);\n        }\n        return hexToBytes(numberToHex(v));\n    }\n    if (v === null || v === undefined) {\n        return Uint8Array.from([]);\n    }\n    throw new Error('toBytes: received unsupported type ' + typeof v);\n}\nexports.utils = {\n    bytesToHex,\n    concatBytes,\n    hexToBytes,\n    utf8ToBytes,\n};\nexports.RLP = { encode, decode };\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQGV0aGVyZXVtanMrcmxwQDQuMC4xL25vZGVfbW9kdWxlcy9AZXRoZXJldW1qcy9ybHAvZGlzdC9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxXQUFXLEdBQUcsYUFBYSxHQUFHLGNBQWMsR0FBRyxjQUFjO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isa0JBQWtCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyxhQUFhO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixtQkFBbUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGtCQUFrQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLG1CQUFtQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsSUFBSTtBQUNwQztBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsRUFBRTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxLQUFLO0FBQ2hCIiwic291cmNlcyI6WyJEOlxcLmRldlxcRExUXFxwb3N0ZXItY29udHJhY3RcXGltcG9zdGVyXFxub2RlX21vZHVsZXNcXC5wbnBtXFxAZXRoZXJldW1qcytybHBANC4wLjFcXG5vZGVfbW9kdWxlc1xcQGV0aGVyZXVtanNcXHJscFxcZGlzdFxcaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlJMUCA9IGV4cG9ydHMudXRpbHMgPSBleHBvcnRzLmRlY29kZSA9IGV4cG9ydHMuZW5jb2RlID0gdm9pZCAwO1xuLyoqXG4gKiBSTFAgRW5jb2RpbmcgYmFzZWQgb24gaHR0cHM6Ly9ldGhlcmV1bS5vcmcvZW4vZGV2ZWxvcGVycy9kb2NzL2RhdGEtc3RydWN0dXJlcy1hbmQtZW5jb2RpbmcvcmxwL1xuICogVGhpcyBmdW5jdGlvbiB0YWtlcyBpbiBkYXRhLCBjb252ZXJ0cyBpdCB0byBVaW50OEFycmF5IGlmIG5vdCxcbiAqIGFuZCBhZGRzIGEgbGVuZ3RoIGZvciByZWN1cnNpb24uXG4gKiBAcGFyYW0gaW5wdXQgV2lsbCBiZSBjb252ZXJ0ZWQgdG8gVWludDhBcnJheVxuICogQHJldHVybnMgVWludDhBcnJheSBvZiBlbmNvZGVkIGRhdGFcbiAqKi9cbmZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuICAgICAgICBjb25zdCBvdXRwdXQgPSBbXTtcbiAgICAgICAgbGV0IG91dHB1dExlbmd0aCA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGVuY29kZWQgPSBlbmNvZGUoaW5wdXRbaV0pO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goZW5jb2RlZCk7XG4gICAgICAgICAgICBvdXRwdXRMZW5ndGggKz0gZW5jb2RlZC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbmNhdEJ5dGVzKGVuY29kZUxlbmd0aChvdXRwdXRMZW5ndGgsIDE5MiksIC4uLm91dHB1dCk7XG4gICAgfVxuICAgIGNvbnN0IGlucHV0QnVmID0gdG9CeXRlcyhpbnB1dCk7XG4gICAgaWYgKGlucHV0QnVmLmxlbmd0aCA9PT0gMSAmJiBpbnB1dEJ1ZlswXSA8IDEyOCkge1xuICAgICAgICByZXR1cm4gaW5wdXRCdWY7XG4gICAgfVxuICAgIHJldHVybiBjb25jYXRCeXRlcyhlbmNvZGVMZW5ndGgoaW5wdXRCdWYubGVuZ3RoLCAxMjgpLCBpbnB1dEJ1Zik7XG59XG5leHBvcnRzLmVuY29kZSA9IGVuY29kZTtcbi8qKlxuICogU2xpY2VzIGEgVWludDhBcnJheSwgdGhyb3dzIGlmIHRoZSBzbGljZSBnb2VzIG91dC1vZi1ib3VuZHMgb2YgdGhlIFVpbnQ4QXJyYXkuXG4gKiBFLmcuIGBzYWZlU2xpY2UoaGV4VG9CeXRlcygnYWEnKSwgMSwgMilgIHdpbGwgdGhyb3cuXG4gKiBAcGFyYW0gaW5wdXRcbiAqIEBwYXJhbSBzdGFydFxuICogQHBhcmFtIGVuZFxuICovXG5mdW5jdGlvbiBzYWZlU2xpY2UoaW5wdXQsIHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoZW5kID4gaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBSTFAgKHNhZmVTbGljZSk6IGVuZCBzbGljZSBvZiBVaW50OEFycmF5IG91dC1vZi1ib3VuZHMnKTtcbiAgICB9XG4gICAgcmV0dXJuIGlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpO1xufVxuLyoqXG4gKiBQYXJzZSBpbnRlZ2Vycy4gQ2hlY2sgaWYgdGhlcmUgaXMgbm8gbGVhZGluZyB6ZXJvc1xuICogQHBhcmFtIHYgVGhlIHZhbHVlIHRvIHBhcnNlXG4gKi9cbmZ1bmN0aW9uIGRlY29kZUxlbmd0aCh2KSB7XG4gICAgaWYgKHZbMF0gPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIFJMUDogZXh0cmEgemVyb3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlSGV4Qnl0ZShieXRlc1RvSGV4KHYpKTtcbn1cbmZ1bmN0aW9uIGVuY29kZUxlbmd0aChsZW4sIG9mZnNldCkge1xuICAgIGlmIChsZW4gPCA1Nikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5mcm9tKFtsZW4gKyBvZmZzZXRdKTtcbiAgICB9XG4gICAgY29uc3QgaGV4TGVuZ3RoID0gbnVtYmVyVG9IZXgobGVuKTtcbiAgICBjb25zdCBsTGVuZ3RoID0gaGV4TGVuZ3RoLmxlbmd0aCAvIDI7XG4gICAgY29uc3QgZmlyc3RCeXRlID0gbnVtYmVyVG9IZXgob2Zmc2V0ICsgNTUgKyBsTGVuZ3RoKTtcbiAgICByZXR1cm4gVWludDhBcnJheS5mcm9tKGhleFRvQnl0ZXMoZmlyc3RCeXRlICsgaGV4TGVuZ3RoKSk7XG59XG5mdW5jdGlvbiBkZWNvZGUoaW5wdXQsIHN0cmVhbSA9IGZhbHNlKSB7XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3VuZGVmaW5lZCcgfHwgaW5wdXQgPT09IG51bGwgfHwgaW5wdXQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LmZyb20oW10pO1xuICAgIH1cbiAgICBjb25zdCBpbnB1dEJ5dGVzID0gdG9CeXRlcyhpbnB1dCk7XG4gICAgY29uc3QgZGVjb2RlZCA9IF9kZWNvZGUoaW5wdXRCeXRlcyk7XG4gICAgaWYgKHN0cmVhbSkge1xuICAgICAgICByZXR1cm4gZGVjb2RlZDtcbiAgICB9XG4gICAgaWYgKGRlY29kZWQucmVtYWluZGVyLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgUkxQOiByZW1haW5kZXIgbXVzdCBiZSB6ZXJvJyk7XG4gICAgfVxuICAgIHJldHVybiBkZWNvZGVkLmRhdGE7XG59XG5leHBvcnRzLmRlY29kZSA9IGRlY29kZTtcbi8qKiBEZWNvZGUgYW4gaW5wdXQgd2l0aCBSTFAgKi9cbmZ1bmN0aW9uIF9kZWNvZGUoaW5wdXQpIHtcbiAgICBsZXQgbGVuZ3RoLCBsbGVuZ3RoLCBkYXRhLCBpbm5lclJlbWFpbmRlciwgZDtcbiAgICBjb25zdCBkZWNvZGVkID0gW107XG4gICAgY29uc3QgZmlyc3RCeXRlID0gaW5wdXRbMF07XG4gICAgaWYgKGZpcnN0Qnl0ZSA8PSAweDdmKSB7XG4gICAgICAgIC8vIGEgc2luZ2xlIGJ5dGUgd2hvc2UgdmFsdWUgaXMgaW4gdGhlIFsweDAwLCAweDdmXSByYW5nZSwgdGhhdCBieXRlIGlzIGl0cyBvd24gUkxQIGVuY29kaW5nLlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogaW5wdXQuc2xpY2UoMCwgMSksXG4gICAgICAgICAgICByZW1haW5kZXI6IGlucHV0LnNsaWNlKDEpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChmaXJzdEJ5dGUgPD0gMHhiNykge1xuICAgICAgICAvLyBzdHJpbmcgaXMgMC01NSBieXRlcyBsb25nLiBBIHNpbmdsZSBieXRlIHdpdGggdmFsdWUgMHg4MCBwbHVzIHRoZSBsZW5ndGggb2YgdGhlIHN0cmluZyBmb2xsb3dlZCBieSB0aGUgc3RyaW5nXG4gICAgICAgIC8vIFRoZSByYW5nZSBvZiB0aGUgZmlyc3QgYnl0ZSBpcyBbMHg4MCwgMHhiN11cbiAgICAgICAgbGVuZ3RoID0gZmlyc3RCeXRlIC0gMHg3ZjtcbiAgICAgICAgLy8gc2V0IDB4ODAgbnVsbCB0byAwXG4gICAgICAgIGlmIChmaXJzdEJ5dGUgPT09IDB4ODApIHtcbiAgICAgICAgICAgIGRhdGEgPSBVaW50OEFycmF5LmZyb20oW10pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YSA9IHNhZmVTbGljZShpbnB1dCwgMSwgbGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID09PSAyICYmIGRhdGFbMF0gPCAweDgwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgUkxQIGVuY29kaW5nOiBpbnZhbGlkIHByZWZpeCwgc2luZ2xlIGJ5dGUgPCAweDgwIGFyZSBub3QgcHJlZml4ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHJlbWFpbmRlcjogaW5wdXQuc2xpY2UobGVuZ3RoKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZmlyc3RCeXRlIDw9IDB4YmYpIHtcbiAgICAgICAgLy8gc3RyaW5nIGlzIGdyZWF0ZXIgdGhhbiA1NSBieXRlcyBsb25nLiBBIHNpbmdsZSBieXRlIHdpdGggdGhlIHZhbHVlICgweGI3IHBsdXMgdGhlIGxlbmd0aCBvZiB0aGUgbGVuZ3RoKSxcbiAgICAgICAgLy8gZm9sbG93ZWQgYnkgdGhlIGxlbmd0aCwgZm9sbG93ZWQgYnkgdGhlIHN0cmluZ1xuICAgICAgICBsbGVuZ3RoID0gZmlyc3RCeXRlIC0gMHhiNjtcbiAgICAgICAgaWYgKGlucHV0Lmxlbmd0aCAtIDEgPCBsbGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgUkxQOiBub3QgZW5vdWdoIGJ5dGVzIGZvciBzdHJpbmcgbGVuZ3RoJyk7XG4gICAgICAgIH1cbiAgICAgICAgbGVuZ3RoID0gZGVjb2RlTGVuZ3RoKHNhZmVTbGljZShpbnB1dCwgMSwgbGxlbmd0aCkpO1xuICAgICAgICBpZiAobGVuZ3RoIDw9IDU1KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgUkxQOiBleHBlY3RlZCBzdHJpbmcgbGVuZ3RoIHRvIGJlIGdyZWF0ZXIgdGhhbiA1NScpO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEgPSBzYWZlU2xpY2UoaW5wdXQsIGxsZW5ndGgsIGxlbmd0aCArIGxsZW5ndGgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHJlbWFpbmRlcjogaW5wdXQuc2xpY2UobGVuZ3RoICsgbGxlbmd0aCksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGZpcnN0Qnl0ZSA8PSAweGY3KSB7XG4gICAgICAgIC8vIGEgbGlzdCBiZXR3ZWVuIDAtNTUgYnl0ZXMgbG9uZ1xuICAgICAgICBsZW5ndGggPSBmaXJzdEJ5dGUgLSAweGJmO1xuICAgICAgICBpbm5lclJlbWFpbmRlciA9IHNhZmVTbGljZShpbnB1dCwgMSwgbGVuZ3RoKTtcbiAgICAgICAgd2hpbGUgKGlubmVyUmVtYWluZGVyLmxlbmd0aCkge1xuICAgICAgICAgICAgZCA9IF9kZWNvZGUoaW5uZXJSZW1haW5kZXIpO1xuICAgICAgICAgICAgZGVjb2RlZC5wdXNoKGQuZGF0YSk7XG4gICAgICAgICAgICBpbm5lclJlbWFpbmRlciA9IGQucmVtYWluZGVyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBkZWNvZGVkLFxuICAgICAgICAgICAgcmVtYWluZGVyOiBpbnB1dC5zbGljZShsZW5ndGgpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gYSBsaXN0IG92ZXIgNTUgYnl0ZXMgbG9uZ1xuICAgICAgICBsbGVuZ3RoID0gZmlyc3RCeXRlIC0gMHhmNjtcbiAgICAgICAgbGVuZ3RoID0gZGVjb2RlTGVuZ3RoKHNhZmVTbGljZShpbnB1dCwgMSwgbGxlbmd0aCkpO1xuICAgICAgICBpZiAobGVuZ3RoIDwgNTYpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBSTFA6IGVuY29kZWQgbGlzdCB0b28gc2hvcnQnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b3RhbExlbmd0aCA9IGxsZW5ndGggKyBsZW5ndGg7XG4gICAgICAgIGlmICh0b3RhbExlbmd0aCA+IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIFJMUDogdG90YWwgbGVuZ3RoIGlzIGxhcmdlciB0aGFuIHRoZSBkYXRhJyk7XG4gICAgICAgIH1cbiAgICAgICAgaW5uZXJSZW1haW5kZXIgPSBzYWZlU2xpY2UoaW5wdXQsIGxsZW5ndGgsIHRvdGFsTGVuZ3RoKTtcbiAgICAgICAgd2hpbGUgKGlubmVyUmVtYWluZGVyLmxlbmd0aCkge1xuICAgICAgICAgICAgZCA9IF9kZWNvZGUoaW5uZXJSZW1haW5kZXIpO1xuICAgICAgICAgICAgZGVjb2RlZC5wdXNoKGQuZGF0YSk7XG4gICAgICAgICAgICBpbm5lclJlbWFpbmRlciA9IGQucmVtYWluZGVyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBkZWNvZGVkLFxuICAgICAgICAgICAgcmVtYWluZGVyOiBpbnB1dC5zbGljZSh0b3RhbExlbmd0aCksXG4gICAgICAgIH07XG4gICAgfVxufVxuY29uc3QgY2FjaGVkSGV4ZXMgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyNTYgfSwgKF92LCBpKSA9PiBpLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKTtcbmZ1bmN0aW9uIGJ5dGVzVG9IZXgodWludDhhKSB7XG4gICAgLy8gUHJlLWNhY2hpbmcgY2hhcnMgd2l0aCBgY2FjaGVkSGV4ZXNgIHNwZWVkcyB0aGlzIHVwIDZ4XG4gICAgbGV0IGhleCA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdWludDhhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhleCArPSBjYWNoZWRIZXhlc1t1aW50OGFbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gaGV4O1xufVxuZnVuY3Rpb24gcGFyc2VIZXhCeXRlKGhleEJ5dGUpIHtcbiAgICBjb25zdCBieXRlID0gTnVtYmVyLnBhcnNlSW50KGhleEJ5dGUsIDE2KTtcbiAgICBpZiAoTnVtYmVyLmlzTmFOKGJ5dGUpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYnl0ZSBzZXF1ZW5jZScpO1xuICAgIHJldHVybiBieXRlO1xufVxuLy8gQ2FjaGluZyBzbG93cyBpdCBkb3duIDItM3hcbmZ1bmN0aW9uIGhleFRvQnl0ZXMoaGV4KSB7XG4gICAgaWYgKHR5cGVvZiBoZXggIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2hleFRvQnl0ZXM6IGV4cGVjdGVkIHN0cmluZywgZ290ICcgKyB0eXBlb2YgaGV4KTtcbiAgICB9XG4gICAgaWYgKGhleC5sZW5ndGggJSAyKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hleFRvQnl0ZXM6IHJlY2VpdmVkIGludmFsaWQgdW5wYWRkZWQgaGV4Jyk7XG4gICAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShoZXgubGVuZ3RoIC8gMik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBqID0gaSAqIDI7XG4gICAgICAgIGFycmF5W2ldID0gcGFyc2VIZXhCeXRlKGhleC5zbGljZShqLCBqICsgMikpO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG59XG4vKiogQ29uY2F0ZW5hdGVzIHR3byBVaW50OEFycmF5cyBpbnRvIG9uZS4gKi9cbmZ1bmN0aW9uIGNvbmNhdEJ5dGVzKC4uLmFycmF5cykge1xuICAgIGlmIChhcnJheXMubGVuZ3RoID09PSAxKVxuICAgICAgICByZXR1cm4gYXJyYXlzWzBdO1xuICAgIGNvbnN0IGxlbmd0aCA9IGFycmF5cy5yZWR1Y2UoKGEsIGFycikgPT4gYSArIGFyci5sZW5ndGgsIDApO1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDAsIHBhZCA9IDA7IGkgPCBhcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYXJyID0gYXJyYXlzW2ldO1xuICAgICAgICByZXN1bHQuc2V0KGFyciwgcGFkKTtcbiAgICAgICAgcGFkICs9IGFyci5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiB1dGY4VG9CeXRlcyh1dGYpIHtcbiAgICByZXR1cm4gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHV0Zik7XG59XG4vKiogVHJhbnNmb3JtIGFuIGludGVnZXIgaW50byBpdHMgaGV4YWRlY2ltYWwgdmFsdWUgKi9cbmZ1bmN0aW9uIG51bWJlclRvSGV4KGludGVnZXIpIHtcbiAgICBpZiAoaW50ZWdlciA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGludGVnZXIgYXMgYXJndW1lbnQsIG11c3QgYmUgdW5zaWduZWQhJyk7XG4gICAgfVxuICAgIGNvbnN0IGhleCA9IGludGVnZXIudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiBoZXgubGVuZ3RoICUgMiA/IGAwJHtoZXh9YCA6IGhleDtcbn1cbi8qKiBQYWQgYSBzdHJpbmcgdG8gYmUgZXZlbiAqL1xuZnVuY3Rpb24gcGFkVG9FdmVuKGEpIHtcbiAgICByZXR1cm4gYS5sZW5ndGggJSAyID8gYDAke2F9YCA6IGE7XG59XG4vKiogQ2hlY2sgaWYgYSBzdHJpbmcgaXMgcHJlZml4ZWQgYnkgMHggKi9cbmZ1bmN0aW9uIGlzSGV4UHJlZml4ZWQoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5sZW5ndGggPj0gMiAmJiBzdHJbMF0gPT09ICcwJyAmJiBzdHJbMV0gPT09ICd4Jztcbn1cbi8qKiBSZW1vdmVzIDB4IGZyb20gYSBnaXZlbiBTdHJpbmcgKi9cbmZ1bmN0aW9uIHN0cmlwSGV4UHJlZml4KHN0cikge1xuICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICByZXR1cm4gaXNIZXhQcmVmaXhlZChzdHIpID8gc3RyLnNsaWNlKDIpIDogc3RyO1xufVxuLyoqIFRyYW5zZm9ybSBhbnl0aGluZyBpbnRvIGEgVWludDhBcnJheSAqL1xuZnVuY3Rpb24gdG9CeXRlcyh2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChpc0hleFByZWZpeGVkKHYpKSB7XG4gICAgICAgICAgICByZXR1cm4gaGV4VG9CeXRlcyhwYWRUb0V2ZW4oc3RyaXBIZXhQcmVmaXgodikpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXModik7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHYgPT09ICdiaWdpbnQnKSB7XG4gICAgICAgIGlmICghdikge1xuICAgICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShbXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhleFRvQnl0ZXMobnVtYmVyVG9IZXgodikpO1xuICAgIH1cbiAgICBpZiAodiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShbXSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigndG9CeXRlczogcmVjZWl2ZWQgdW5zdXBwb3J0ZWQgdHlwZSAnICsgdHlwZW9mIHYpO1xufVxuZXhwb3J0cy51dGlscyA9IHtcbiAgICBieXRlc1RvSGV4LFxuICAgIGNvbmNhdEJ5dGVzLFxuICAgIGhleFRvQnl0ZXMsXG4gICAgdXRmOFRvQnl0ZXMsXG59O1xuZXhwb3J0cy5STFAgPSB7IGVuY29kZSwgZGVjb2RlIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@ethereumjs+rlp@4.0.1/node_modules/@ethereumjs/rlp/dist/index.js\n");

/***/ })

};
;