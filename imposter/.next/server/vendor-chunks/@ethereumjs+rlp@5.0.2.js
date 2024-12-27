"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@ethereumjs+rlp@5.0.2";
exports.ids = ["vendor-chunks/@ethereumjs+rlp@5.0.2"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/@ethereumjs+rlp@5.0.2/node_modules/@ethereumjs/rlp/dist/esm/index.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/.pnpm/@ethereumjs+rlp@5.0.2/node_modules/@ethereumjs/rlp/dist/esm/index.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   RLP: () => (/* binding */ RLP),\n/* harmony export */   decode: () => (/* binding */ decode),\n/* harmony export */   encode: () => (/* binding */ encode),\n/* harmony export */   utils: () => (/* binding */ utils)\n/* harmony export */ });\n/**\n * RLP Encoding based on https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/\n * This function takes in data, converts it to Uint8Array if not,\n * and adds a length for recursion.\n * @param input Will be converted to Uint8Array\n * @returns Uint8Array of encoded data\n **/\nfunction encode(input) {\n    if (Array.isArray(input)) {\n        const output = [];\n        let outputLength = 0;\n        for (let i = 0; i < input.length; i++) {\n            const encoded = encode(input[i]);\n            output.push(encoded);\n            outputLength += encoded.length;\n        }\n        return concatBytes(encodeLength(outputLength, 192), ...output);\n    }\n    const inputBuf = toBytes(input);\n    if (inputBuf.length === 1 && inputBuf[0] < 128) {\n        return inputBuf;\n    }\n    return concatBytes(encodeLength(inputBuf.length, 128), inputBuf);\n}\n/**\n * Slices a Uint8Array, throws if the slice goes out-of-bounds of the Uint8Array.\n * E.g. `safeSlice(hexToBytes('aa'), 1, 2)` will throw.\n * @param input\n * @param start\n * @param end\n */\nfunction safeSlice(input, start, end) {\n    if (end > input.length) {\n        throw new Error('invalid RLP (safeSlice): end slice of Uint8Array out-of-bounds');\n    }\n    return input.slice(start, end);\n}\n/**\n * Parse integers. Check if there is no leading zeros\n * @param v The value to parse\n */\nfunction decodeLength(v) {\n    if (v[0] === 0) {\n        throw new Error('invalid RLP: extra zeros');\n    }\n    return parseHexByte(bytesToHex(v));\n}\nfunction encodeLength(len, offset) {\n    if (len < 56) {\n        return Uint8Array.from([len + offset]);\n    }\n    const hexLength = numberToHex(len);\n    const lLength = hexLength.length / 2;\n    const firstByte = numberToHex(offset + 55 + lLength);\n    return Uint8Array.from(hexToBytes(firstByte + hexLength));\n}\nfunction decode(input, stream = false) {\n    if (typeof input === 'undefined' || input === null || input.length === 0) {\n        return Uint8Array.from([]);\n    }\n    const inputBytes = toBytes(input);\n    const decoded = _decode(inputBytes);\n    if (stream) {\n        return {\n            data: decoded.data,\n            remainder: decoded.remainder.slice(),\n        };\n    }\n    if (decoded.remainder.length !== 0) {\n        throw new Error('invalid RLP: remainder must be zero');\n    }\n    return decoded.data;\n}\n/** Decode an input with RLP */\nfunction _decode(input) {\n    let length, llength, data, innerRemainder, d;\n    const decoded = [];\n    const firstByte = input[0];\n    if (firstByte <= 0x7f) {\n        // a single byte whose value is in the [0x00, 0x7f] range, that byte is its own RLP encoding.\n        return {\n            data: input.slice(0, 1),\n            remainder: input.subarray(1),\n        };\n    }\n    else if (firstByte <= 0xb7) {\n        // string is 0-55 bytes long. A single byte with value 0x80 plus the length of the string followed by the string\n        // The range of the first byte is [0x80, 0xb7]\n        length = firstByte - 0x7f;\n        // set 0x80 null to 0\n        if (firstByte === 0x80) {\n            data = Uint8Array.from([]);\n        }\n        else {\n            data = safeSlice(input, 1, length);\n        }\n        if (length === 2 && data[0] < 0x80) {\n            throw new Error('invalid RLP encoding: invalid prefix, single byte < 0x80 are not prefixed');\n        }\n        return {\n            data,\n            remainder: input.subarray(length),\n        };\n    }\n    else if (firstByte <= 0xbf) {\n        // string is greater than 55 bytes long. A single byte with the value (0xb7 plus the length of the length),\n        // followed by the length, followed by the string\n        llength = firstByte - 0xb6;\n        if (input.length - 1 < llength) {\n            throw new Error('invalid RLP: not enough bytes for string length');\n        }\n        length = decodeLength(safeSlice(input, 1, llength));\n        if (length <= 55) {\n            throw new Error('invalid RLP: expected string length to be greater than 55');\n        }\n        data = safeSlice(input, llength, length + llength);\n        return {\n            data,\n            remainder: input.subarray(length + llength),\n        };\n    }\n    else if (firstByte <= 0xf7) {\n        // a list between 0-55 bytes long\n        length = firstByte - 0xbf;\n        innerRemainder = safeSlice(input, 1, length);\n        while (innerRemainder.length) {\n            d = _decode(innerRemainder);\n            decoded.push(d.data);\n            innerRemainder = d.remainder;\n        }\n        return {\n            data: decoded,\n            remainder: input.subarray(length),\n        };\n    }\n    else {\n        // a list over 55 bytes long\n        llength = firstByte - 0xf6;\n        length = decodeLength(safeSlice(input, 1, llength));\n        if (length < 56) {\n            throw new Error('invalid RLP: encoded list too short');\n        }\n        const totalLength = llength + length;\n        if (totalLength > input.length) {\n            throw new Error('invalid RLP: total length is larger than the data');\n        }\n        innerRemainder = safeSlice(input, llength, totalLength);\n        while (innerRemainder.length) {\n            d = _decode(innerRemainder);\n            decoded.push(d.data);\n            innerRemainder = d.remainder;\n        }\n        return {\n            data: decoded,\n            remainder: input.subarray(totalLength),\n        };\n    }\n}\nconst cachedHexes = Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, '0'));\nfunction bytesToHex(uint8a) {\n    // Pre-caching chars with `cachedHexes` speeds this up 6x\n    let hex = '';\n    for (let i = 0; i < uint8a.length; i++) {\n        hex += cachedHexes[uint8a[i]];\n    }\n    return hex;\n}\nfunction parseHexByte(hexByte) {\n    const byte = Number.parseInt(hexByte, 16);\n    if (Number.isNaN(byte))\n        throw new Error('Invalid byte sequence');\n    return byte;\n}\n// Caching slows it down 2-3x\nfunction hexToBytes(hex) {\n    if (typeof hex !== 'string') {\n        throw new TypeError('hexToBytes: expected string, got ' + typeof hex);\n    }\n    if (hex.length % 2)\n        throw new Error('hexToBytes: received invalid unpadded hex');\n    const array = new Uint8Array(hex.length / 2);\n    for (let i = 0; i < array.length; i++) {\n        const j = i * 2;\n        array[i] = parseHexByte(hex.slice(j, j + 2));\n    }\n    return array;\n}\n/** Concatenates two Uint8Arrays into one. */\nfunction concatBytes(...arrays) {\n    if (arrays.length === 1)\n        return arrays[0];\n    const length = arrays.reduce((a, arr) => a + arr.length, 0);\n    const result = new Uint8Array(length);\n    for (let i = 0, pad = 0; i < arrays.length; i++) {\n        const arr = arrays[i];\n        result.set(arr, pad);\n        pad += arr.length;\n    }\n    return result;\n}\nfunction utf8ToBytes(utf) {\n    return new TextEncoder().encode(utf);\n}\n/** Transform an integer into its hexadecimal value */\nfunction numberToHex(integer) {\n    if (integer < 0) {\n        throw new Error('Invalid integer as argument, must be unsigned!');\n    }\n    const hex = integer.toString(16);\n    return hex.length % 2 ? `0${hex}` : hex;\n}\n/** Pad a string to be even */\nfunction padToEven(a) {\n    return a.length % 2 ? `0${a}` : a;\n}\n/** Check if a string is prefixed by 0x */\nfunction isHexPrefixed(str) {\n    return str.length >= 2 && str[0] === '0' && str[1] === 'x';\n}\n/** Removes 0x from a given String */\nfunction stripHexPrefix(str) {\n    if (typeof str !== 'string') {\n        return str;\n    }\n    return isHexPrefixed(str) ? str.slice(2) : str;\n}\n/** Transform anything into a Uint8Array */\nfunction toBytes(v) {\n    if (v instanceof Uint8Array) {\n        return v;\n    }\n    if (typeof v === 'string') {\n        if (isHexPrefixed(v)) {\n            return hexToBytes(padToEven(stripHexPrefix(v)));\n        }\n        return utf8ToBytes(v);\n    }\n    if (typeof v === 'number' || typeof v === 'bigint') {\n        if (!v) {\n            return Uint8Array.from([]);\n        }\n        return hexToBytes(numberToHex(v));\n    }\n    if (v === null || v === undefined) {\n        return Uint8Array.from([]);\n    }\n    throw new Error('toBytes: received unsupported type ' + typeof v);\n}\nconst utils = {\n    bytesToHex,\n    concatBytes,\n    hexToBytes,\n    utf8ToBytes,\n};\nconst RLP = { encode, decode };\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vQGV0aGVyZXVtanMrcmxwQDUuMC4yL25vZGVfbW9kdWxlcy9AZXRoZXJldW1qcy9ybHAvZGlzdC9lc20vaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isa0JBQWtCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsYUFBYTtBQUM5QztBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsbUJBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixtQkFBbUI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLElBQUk7QUFDcEM7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLEVBQUU7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxjQUFjO0FBQ3JCIiwic291cmNlcyI6WyJEOlxcLmRldlxcRExUXFxwb3N0ZXItY29udHJhY3RcXGltcG9zdGVyXFxub2RlX21vZHVsZXNcXC5wbnBtXFxAZXRoZXJldW1qcytybHBANS4wLjJcXG5vZGVfbW9kdWxlc1xcQGV0aGVyZXVtanNcXHJscFxcZGlzdFxcZXNtXFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJMUCBFbmNvZGluZyBiYXNlZCBvbiBodHRwczovL2V0aGVyZXVtLm9yZy9lbi9kZXZlbG9wZXJzL2RvY3MvZGF0YS1zdHJ1Y3R1cmVzLWFuZC1lbmNvZGluZy9ybHAvXG4gKiBUaGlzIGZ1bmN0aW9uIHRha2VzIGluIGRhdGEsIGNvbnZlcnRzIGl0IHRvIFVpbnQ4QXJyYXkgaWYgbm90LFxuICogYW5kIGFkZHMgYSBsZW5ndGggZm9yIHJlY3Vyc2lvbi5cbiAqIEBwYXJhbSBpbnB1dCBXaWxsIGJlIGNvbnZlcnRlZCB0byBVaW50OEFycmF5XG4gKiBAcmV0dXJucyBVaW50OEFycmF5IG9mIGVuY29kZWQgZGF0YVxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuICAgICAgICBjb25zdCBvdXRwdXQgPSBbXTtcbiAgICAgICAgbGV0IG91dHB1dExlbmd0aCA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGVuY29kZWQgPSBlbmNvZGUoaW5wdXRbaV0pO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goZW5jb2RlZCk7XG4gICAgICAgICAgICBvdXRwdXRMZW5ndGggKz0gZW5jb2RlZC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbmNhdEJ5dGVzKGVuY29kZUxlbmd0aChvdXRwdXRMZW5ndGgsIDE5MiksIC4uLm91dHB1dCk7XG4gICAgfVxuICAgIGNvbnN0IGlucHV0QnVmID0gdG9CeXRlcyhpbnB1dCk7XG4gICAgaWYgKGlucHV0QnVmLmxlbmd0aCA9PT0gMSAmJiBpbnB1dEJ1ZlswXSA8IDEyOCkge1xuICAgICAgICByZXR1cm4gaW5wdXRCdWY7XG4gICAgfVxuICAgIHJldHVybiBjb25jYXRCeXRlcyhlbmNvZGVMZW5ndGgoaW5wdXRCdWYubGVuZ3RoLCAxMjgpLCBpbnB1dEJ1Zik7XG59XG4vKipcbiAqIFNsaWNlcyBhIFVpbnQ4QXJyYXksIHRocm93cyBpZiB0aGUgc2xpY2UgZ29lcyBvdXQtb2YtYm91bmRzIG9mIHRoZSBVaW50OEFycmF5LlxuICogRS5nLiBgc2FmZVNsaWNlKGhleFRvQnl0ZXMoJ2FhJyksIDEsIDIpYCB3aWxsIHRocm93LlxuICogQHBhcmFtIGlucHV0XG4gKiBAcGFyYW0gc3RhcnRcbiAqIEBwYXJhbSBlbmRcbiAqL1xuZnVuY3Rpb24gc2FmZVNsaWNlKGlucHV0LCBzdGFydCwgZW5kKSB7XG4gICAgaWYgKGVuZCA+IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgUkxQIChzYWZlU2xpY2UpOiBlbmQgc2xpY2Ugb2YgVWludDhBcnJheSBvdXQtb2YtYm91bmRzJyk7XG4gICAgfVxuICAgIHJldHVybiBpbnB1dC5zbGljZShzdGFydCwgZW5kKTtcbn1cbi8qKlxuICogUGFyc2UgaW50ZWdlcnMuIENoZWNrIGlmIHRoZXJlIGlzIG5vIGxlYWRpbmcgemVyb3NcbiAqIEBwYXJhbSB2IFRoZSB2YWx1ZSB0byBwYXJzZVxuICovXG5mdW5jdGlvbiBkZWNvZGVMZW5ndGgodikge1xuICAgIGlmICh2WzBdID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBSTFA6IGV4dHJhIHplcm9zJyk7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZUhleEJ5dGUoYnl0ZXNUb0hleCh2KSk7XG59XG5mdW5jdGlvbiBlbmNvZGVMZW5ndGgobGVuLCBvZmZzZXQpIHtcbiAgICBpZiAobGVuIDwgNTYpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShbbGVuICsgb2Zmc2V0XSk7XG4gICAgfVxuICAgIGNvbnN0IGhleExlbmd0aCA9IG51bWJlclRvSGV4KGxlbik7XG4gICAgY29uc3QgbExlbmd0aCA9IGhleExlbmd0aC5sZW5ndGggLyAyO1xuICAgIGNvbnN0IGZpcnN0Qnl0ZSA9IG51bWJlclRvSGV4KG9mZnNldCArIDU1ICsgbExlbmd0aCk7XG4gICAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShoZXhUb0J5dGVzKGZpcnN0Qnl0ZSArIGhleExlbmd0aCkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShpbnB1dCwgc3RyZWFtID0gZmFsc2UpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAndW5kZWZpbmVkJyB8fCBpbnB1dCA9PT0gbnVsbCB8fCBpbnB1dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShbXSk7XG4gICAgfVxuICAgIGNvbnN0IGlucHV0Qnl0ZXMgPSB0b0J5dGVzKGlucHV0KTtcbiAgICBjb25zdCBkZWNvZGVkID0gX2RlY29kZShpbnB1dEJ5dGVzKTtcbiAgICBpZiAoc3RyZWFtKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBkZWNvZGVkLmRhdGEsXG4gICAgICAgICAgICByZW1haW5kZXI6IGRlY29kZWQucmVtYWluZGVyLnNsaWNlKCksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChkZWNvZGVkLnJlbWFpbmRlci5sZW5ndGggIT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIFJMUDogcmVtYWluZGVyIG11c3QgYmUgemVybycpO1xuICAgIH1cbiAgICByZXR1cm4gZGVjb2RlZC5kYXRhO1xufVxuLyoqIERlY29kZSBhbiBpbnB1dCB3aXRoIFJMUCAqL1xuZnVuY3Rpb24gX2RlY29kZShpbnB1dCkge1xuICAgIGxldCBsZW5ndGgsIGxsZW5ndGgsIGRhdGEsIGlubmVyUmVtYWluZGVyLCBkO1xuICAgIGNvbnN0IGRlY29kZWQgPSBbXTtcbiAgICBjb25zdCBmaXJzdEJ5dGUgPSBpbnB1dFswXTtcbiAgICBpZiAoZmlyc3RCeXRlIDw9IDB4N2YpIHtcbiAgICAgICAgLy8gYSBzaW5nbGUgYnl0ZSB3aG9zZSB2YWx1ZSBpcyBpbiB0aGUgWzB4MDAsIDB4N2ZdIHJhbmdlLCB0aGF0IGJ5dGUgaXMgaXRzIG93biBSTFAgZW5jb2RpbmcuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhOiBpbnB1dC5zbGljZSgwLCAxKSxcbiAgICAgICAgICAgIHJlbWFpbmRlcjogaW5wdXQuc3ViYXJyYXkoMSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGZpcnN0Qnl0ZSA8PSAweGI3KSB7XG4gICAgICAgIC8vIHN0cmluZyBpcyAwLTU1IGJ5dGVzIGxvbmcuIEEgc2luZ2xlIGJ5dGUgd2l0aCB2YWx1ZSAweDgwIHBsdXMgdGhlIGxlbmd0aCBvZiB0aGUgc3RyaW5nIGZvbGxvd2VkIGJ5IHRoZSBzdHJpbmdcbiAgICAgICAgLy8gVGhlIHJhbmdlIG9mIHRoZSBmaXJzdCBieXRlIGlzIFsweDgwLCAweGI3XVxuICAgICAgICBsZW5ndGggPSBmaXJzdEJ5dGUgLSAweDdmO1xuICAgICAgICAvLyBzZXQgMHg4MCBudWxsIHRvIDBcbiAgICAgICAgaWYgKGZpcnN0Qnl0ZSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgZGF0YSA9IFVpbnQ4QXJyYXkuZnJvbShbXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkYXRhID0gc2FmZVNsaWNlKGlucHV0LCAxLCBsZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPT09IDIgJiYgZGF0YVswXSA8IDB4ODApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBSTFAgZW5jb2Rpbmc6IGludmFsaWQgcHJlZml4LCBzaW5nbGUgYnl0ZSA8IDB4ODAgYXJlIG5vdCBwcmVmaXhlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcmVtYWluZGVyOiBpbnB1dC5zdWJhcnJheShsZW5ndGgpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChmaXJzdEJ5dGUgPD0gMHhiZikge1xuICAgICAgICAvLyBzdHJpbmcgaXMgZ3JlYXRlciB0aGFuIDU1IGJ5dGVzIGxvbmcuIEEgc2luZ2xlIGJ5dGUgd2l0aCB0aGUgdmFsdWUgKDB4YjcgcGx1cyB0aGUgbGVuZ3RoIG9mIHRoZSBsZW5ndGgpLFxuICAgICAgICAvLyBmb2xsb3dlZCBieSB0aGUgbGVuZ3RoLCBmb2xsb3dlZCBieSB0aGUgc3RyaW5nXG4gICAgICAgIGxsZW5ndGggPSBmaXJzdEJ5dGUgLSAweGI2O1xuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoIC0gMSA8IGxsZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBSTFA6IG5vdCBlbm91Z2ggYnl0ZXMgZm9yIHN0cmluZyBsZW5ndGgnKTtcbiAgICAgICAgfVxuICAgICAgICBsZW5ndGggPSBkZWNvZGVMZW5ndGgoc2FmZVNsaWNlKGlucHV0LCAxLCBsbGVuZ3RoKSk7XG4gICAgICAgIGlmIChsZW5ndGggPD0gNTUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBSTFA6IGV4cGVjdGVkIHN0cmluZyBsZW5ndGggdG8gYmUgZ3JlYXRlciB0aGFuIDU1Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YSA9IHNhZmVTbGljZShpbnB1dCwgbGxlbmd0aCwgbGVuZ3RoICsgbGxlbmd0aCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcmVtYWluZGVyOiBpbnB1dC5zdWJhcnJheShsZW5ndGggKyBsbGVuZ3RoKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZmlyc3RCeXRlIDw9IDB4ZjcpIHtcbiAgICAgICAgLy8gYSBsaXN0IGJldHdlZW4gMC01NSBieXRlcyBsb25nXG4gICAgICAgIGxlbmd0aCA9IGZpcnN0Qnl0ZSAtIDB4YmY7XG4gICAgICAgIGlubmVyUmVtYWluZGVyID0gc2FmZVNsaWNlKGlucHV0LCAxLCBsZW5ndGgpO1xuICAgICAgICB3aGlsZSAoaW5uZXJSZW1haW5kZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICBkID0gX2RlY29kZShpbm5lclJlbWFpbmRlcik7XG4gICAgICAgICAgICBkZWNvZGVkLnB1c2goZC5kYXRhKTtcbiAgICAgICAgICAgIGlubmVyUmVtYWluZGVyID0gZC5yZW1haW5kZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IGRlY29kZWQsXG4gICAgICAgICAgICByZW1haW5kZXI6IGlucHV0LnN1YmFycmF5KGxlbmd0aCksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBhIGxpc3Qgb3ZlciA1NSBieXRlcyBsb25nXG4gICAgICAgIGxsZW5ndGggPSBmaXJzdEJ5dGUgLSAweGY2O1xuICAgICAgICBsZW5ndGggPSBkZWNvZGVMZW5ndGgoc2FmZVNsaWNlKGlucHV0LCAxLCBsbGVuZ3RoKSk7XG4gICAgICAgIGlmIChsZW5ndGggPCA1Nikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIFJMUDogZW5jb2RlZCBsaXN0IHRvbyBzaG9ydCcpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsTGVuZ3RoID0gbGxlbmd0aCArIGxlbmd0aDtcbiAgICAgICAgaWYgKHRvdGFsTGVuZ3RoID4gaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgUkxQOiB0b3RhbCBsZW5ndGggaXMgbGFyZ2VyIHRoYW4gdGhlIGRhdGEnKTtcbiAgICAgICAgfVxuICAgICAgICBpbm5lclJlbWFpbmRlciA9IHNhZmVTbGljZShpbnB1dCwgbGxlbmd0aCwgdG90YWxMZW5ndGgpO1xuICAgICAgICB3aGlsZSAoaW5uZXJSZW1haW5kZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICBkID0gX2RlY29kZShpbm5lclJlbWFpbmRlcik7XG4gICAgICAgICAgICBkZWNvZGVkLnB1c2goZC5kYXRhKTtcbiAgICAgICAgICAgIGlubmVyUmVtYWluZGVyID0gZC5yZW1haW5kZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IGRlY29kZWQsXG4gICAgICAgICAgICByZW1haW5kZXI6IGlucHV0LnN1YmFycmF5KHRvdGFsTGVuZ3RoKSxcbiAgICAgICAgfTtcbiAgICB9XG59XG5jb25zdCBjYWNoZWRIZXhlcyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDI1NiB9LCAoX3YsIGkpID0+IGkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpO1xuZnVuY3Rpb24gYnl0ZXNUb0hleCh1aW50OGEpIHtcbiAgICAvLyBQcmUtY2FjaGluZyBjaGFycyB3aXRoIGBjYWNoZWRIZXhlc2Agc3BlZWRzIHRoaXMgdXAgNnhcbiAgICBsZXQgaGV4ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1aW50OGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGV4ICs9IGNhY2hlZEhleGVzW3VpbnQ4YVtpXV07XG4gICAgfVxuICAgIHJldHVybiBoZXg7XG59XG5mdW5jdGlvbiBwYXJzZUhleEJ5dGUoaGV4Qnl0ZSkge1xuICAgIGNvbnN0IGJ5dGUgPSBOdW1iZXIucGFyc2VJbnQoaGV4Qnl0ZSwgMTYpO1xuICAgIGlmIChOdW1iZXIuaXNOYU4oYnl0ZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBieXRlIHNlcXVlbmNlJyk7XG4gICAgcmV0dXJuIGJ5dGU7XG59XG4vLyBDYWNoaW5nIHNsb3dzIGl0IGRvd24gMi0zeFxuZnVuY3Rpb24gaGV4VG9CeXRlcyhoZXgpIHtcbiAgICBpZiAodHlwZW9mIGhleCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaGV4VG9CeXRlczogZXhwZWN0ZWQgc3RyaW5nLCBnb3QgJyArIHR5cGVvZiBoZXgpO1xuICAgIH1cbiAgICBpZiAoaGV4Lmxlbmd0aCAlIDIpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaGV4VG9CeXRlczogcmVjZWl2ZWQgaW52YWxpZCB1bnBhZGRlZCBoZXgnKTtcbiAgICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KGhleC5sZW5ndGggLyAyKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGogPSBpICogMjtcbiAgICAgICAgYXJyYXlbaV0gPSBwYXJzZUhleEJ5dGUoaGV4LnNsaWNlKGosIGogKyAyKSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbn1cbi8qKiBDb25jYXRlbmF0ZXMgdHdvIFVpbnQ4QXJyYXlzIGludG8gb25lLiAqL1xuZnVuY3Rpb24gY29uY2F0Qnl0ZXMoLi4uYXJyYXlzKSB7XG4gICAgaWYgKGFycmF5cy5sZW5ndGggPT09IDEpXG4gICAgICAgIHJldHVybiBhcnJheXNbMF07XG4gICAgY29uc3QgbGVuZ3RoID0gYXJyYXlzLnJlZHVjZSgoYSwgYXJyKSA9PiBhICsgYXJyLmxlbmd0aCwgMCk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMCwgcGFkID0gMDsgaSA8IGFycmF5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBhcnIgPSBhcnJheXNbaV07XG4gICAgICAgIHJlc3VsdC5zZXQoYXJyLCBwYWQpO1xuICAgICAgICBwYWQgKz0gYXJyLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzKHV0Zikge1xuICAgIHJldHVybiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodXRmKTtcbn1cbi8qKiBUcmFuc2Zvcm0gYW4gaW50ZWdlciBpbnRvIGl0cyBoZXhhZGVjaW1hbCB2YWx1ZSAqL1xuZnVuY3Rpb24gbnVtYmVyVG9IZXgoaW50ZWdlcikge1xuICAgIGlmIChpbnRlZ2VyIDwgMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW50ZWdlciBhcyBhcmd1bWVudCwgbXVzdCBiZSB1bnNpZ25lZCEnKTtcbiAgICB9XG4gICAgY29uc3QgaGV4ID0gaW50ZWdlci50b1N0cmluZygxNik7XG4gICAgcmV0dXJuIGhleC5sZW5ndGggJSAyID8gYDAke2hleH1gIDogaGV4O1xufVxuLyoqIFBhZCBhIHN0cmluZyB0byBiZSBldmVuICovXG5mdW5jdGlvbiBwYWRUb0V2ZW4oYSkge1xuICAgIHJldHVybiBhLmxlbmd0aCAlIDIgPyBgMCR7YX1gIDogYTtcbn1cbi8qKiBDaGVjayBpZiBhIHN0cmluZyBpcyBwcmVmaXhlZCBieSAweCAqL1xuZnVuY3Rpb24gaXNIZXhQcmVmaXhlZChzdHIpIHtcbiAgICByZXR1cm4gc3RyLmxlbmd0aCA+PSAyICYmIHN0clswXSA9PT0gJzAnICYmIHN0clsxXSA9PT0gJ3gnO1xufVxuLyoqIFJlbW92ZXMgMHggZnJvbSBhIGdpdmVuIFN0cmluZyAqL1xuZnVuY3Rpb24gc3RyaXBIZXhQcmVmaXgoc3RyKSB7XG4gICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIHJldHVybiBpc0hleFByZWZpeGVkKHN0cikgPyBzdHIuc2xpY2UoMikgOiBzdHI7XG59XG4vKiogVHJhbnNmb3JtIGFueXRoaW5nIGludG8gYSBVaW50OEFycmF5ICovXG5mdW5jdGlvbiB0b0J5dGVzKHYpIHtcbiAgICBpZiAodiBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGlzSGV4UHJlZml4ZWQodikpIHtcbiAgICAgICAgICAgIHJldHVybiBoZXhUb0J5dGVzKHBhZFRvRXZlbihzdHJpcEhleFByZWZpeCh2KSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyh2KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdiA9PT0gJ2JpZ2ludCcpIHtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgICByZXR1cm4gVWludDhBcnJheS5mcm9tKFtdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGV4VG9CeXRlcyhudW1iZXJUb0hleCh2KSk7XG4gICAgfVxuICAgIGlmICh2ID09PSBudWxsIHx8IHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5mcm9tKFtdKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCd0b0J5dGVzOiByZWNlaXZlZCB1bnN1cHBvcnRlZCB0eXBlICcgKyB0eXBlb2Ygdik7XG59XG5leHBvcnQgY29uc3QgdXRpbHMgPSB7XG4gICAgYnl0ZXNUb0hleCxcbiAgICBjb25jYXRCeXRlcyxcbiAgICBoZXhUb0J5dGVzLFxuICAgIHV0ZjhUb0J5dGVzLFxufTtcbmV4cG9ydCBjb25zdCBSTFAgPSB7IGVuY29kZSwgZGVjb2RlIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/@ethereumjs+rlp@5.0.2/node_modules/@ethereumjs/rlp/dist/esm/index.js\n");

/***/ })

};
;