"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMiniAppSignatureHeaders = exports.buildCanonicalQuery = exports.stableStringify = exports.sha256Hex = void 0;
var config_1 = require("./config");
var HEADER_CLIENT_ID = 'X-Mini-Client-Id';
var HEADER_TIMESTAMP = 'X-Mini-Timestamp';
var HEADER_NONCE = 'X-Mini-Nonce';
var HEADER_SIGNATURE = 'X-Mini-Signature';
function utf8Encode(input) {
    var bytes = [];
    for (var i = 0; i < input.length; i += 1) {
        var codePoint = input.charCodeAt(i);
        if (codePoint >= 0xd800 && codePoint <= 0xdbff && i + 1 < input.length) {
            var next = input.charCodeAt(i + 1);
            if (next >= 0xdc00 && next <= 0xdfff) {
                codePoint = ((codePoint - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
                i += 1;
            }
        }
        if (codePoint <= 0x7f) {
            bytes.push(codePoint);
        }
        else if (codePoint <= 0x7ff) {
            bytes.push(0xc0 | (codePoint >> 6));
            bytes.push(0x80 | (codePoint & 0x3f));
        }
        else if (codePoint <= 0xffff) {
            bytes.push(0xe0 | (codePoint >> 12));
            bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
            bytes.push(0x80 | (codePoint & 0x3f));
        }
        else {
            bytes.push(0xf0 | (codePoint >> 18));
            bytes.push(0x80 | ((codePoint >> 12) & 0x3f));
            bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
            bytes.push(0x80 | (codePoint & 0x3f));
        }
    }
    return bytes;
}
function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
}
function sha256Hex(input) {
    var bytes = utf8Encode(input);
    var bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) {
        bytes.push(0);
    }
    var highBits = Math.floor(bitLength / 0x100000000);
    var lowBits = bitLength >>> 0;
    for (var shift = 24; shift >= 0; shift -= 8) {
        bytes.push((highBits >>> shift) & 0xff);
    }
    for (var shift = 24; shift >= 0; shift -= 8) {
        bytes.push((lowBits >>> shift) & 0xff);
    }
    var hash = [
        0x6a09e667,
        0xbb67ae85,
        0x3c6ef372,
        0xa54ff53a,
        0x510e527f,
        0x9b05688c,
        0x1f83d9ab,
        0x5be0cd19
    ];
    var k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
        0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
        0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
        0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
        0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    var words = new Array(64);
    for (var offset = 0; offset < bytes.length; offset += 64) {
        for (var i = 0; i < 16; i += 1) {
            var base = offset + i * 4;
            words[i] = (((bytes[base] << 24) |
                (bytes[base + 1] << 16) |
                (bytes[base + 2] << 8) |
                bytes[base + 3])) >>> 0;
        }
        for (var i = 16; i < 64; i += 1) {
            var s0 = rightRotate(words[i - 15], 7) ^ rightRotate(words[i - 15], 18) ^ (words[i - 15] >>> 3);
            var s1 = rightRotate(words[i - 2], 17) ^ rightRotate(words[i - 2], 19) ^ (words[i - 2] >>> 10);
            words[i] = (words[i - 16] + s0 + words[i - 7] + s1) >>> 0;
        }
        var a = hash[0];
        var b = hash[1];
        var c = hash[2];
        var d = hash[3];
        var e = hash[4];
        var f = hash[5];
        var g = hash[6];
        var h = hash[7];
        for (var i = 0; i < 64; i += 1) {
            var s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            var choice = (e & f) ^ (~e & g);
            var temp1 = (h + s1 + choice + k[i] + words[i]) >>> 0;
            var s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            var majority = (a & b) ^ (a & c) ^ (b & c);
            var temp2 = (s0 + majority) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }
        hash[0] = (hash[0] + a) >>> 0;
        hash[1] = (hash[1] + b) >>> 0;
        hash[2] = (hash[2] + c) >>> 0;
        hash[3] = (hash[3] + d) >>> 0;
        hash[4] = (hash[4] + e) >>> 0;
        hash[5] = (hash[5] + f) >>> 0;
        hash[6] = (hash[6] + g) >>> 0;
        hash[7] = (hash[7] + h) >>> 0;
    }
    return hash.map(function (part) { return part.toString(16).padStart(8, '0'); }).join('');
}
exports.sha256Hex = sha256Hex;
function stableStringify(value) {
    if (value === undefined) {
        return '';
    }
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return "[".concat(value.map(function (item) { return stableStringify(item); }).join(','), "]");
    }
    var keys = Object.keys(value)
        .filter(function (key) { return value[key] !== undefined; })
        .sort();
    return "{".concat(keys.map(function (key) { return "".concat(JSON.stringify(key), ":").concat(stableStringify(value[key])); }).join(','), "}");
}
exports.stableStringify = stableStringify;
function stringifyQueryValue(value) {
    if (value === undefined || value === null) {
        return '';
    }
    if (typeof value === 'object') {
        return stableStringify(value);
    }
    return String(value);
}
function buildCanonicalQuery(data) {
    if (!data) {
        return '';
    }
    var pairs = [];
    Object.keys(data).sort().forEach(function (key) {
        var value = data[key];
        if (value === undefined) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(function (item) {
                pairs.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(stringifyQueryValue(item))));
            });
            return;
        }
        pairs.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(stringifyQueryValue(value))));
    });
    return pairs.join('&');
}
exports.buildCanonicalQuery = buildCanonicalQuery;
function buildSignature(method, requestPath, query, body, timestamp, nonce) {
    var clientId = (0, config_1.getMiniAppClientId)();
    var secret = (0, config_1.getMiniAppSharedSecret)();
    var payload = [
        clientId,
        timestamp,
        nonce,
        method.toUpperCase(),
        requestPath,
        query,
        sha256Hex(body),
        secret
    ].join('\n');
    return sha256Hex(payload);
}
function createNonce() {
    return "".concat(Date.now().toString(36)).concat(Math.random().toString(36).slice(2, 10));
}
function buildMiniAppSignatureHeaders(method, requestPath, query, body) {
    var timestamp = String(Date.now());
    var nonce = createNonce();
    var _a;
    return _a = {},
        _a[HEADER_CLIENT_ID] = (0, config_1.getMiniAppClientId)(),
        _a[HEADER_TIMESTAMP] = timestamp,
        _a[HEADER_NONCE] = nonce,
        _a[HEADER_SIGNATURE] = buildSignature(method, requestPath, query, body, timestamp, nonce),
        _a;
}
exports.buildMiniAppSignatureHeaders = buildMiniAppSignatureHeaders;
