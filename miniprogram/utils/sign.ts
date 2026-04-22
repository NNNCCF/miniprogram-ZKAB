import { getMiniAppClientId, getMiniAppSharedSecret } from './config'

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue | undefined }

const HEADER_CLIENT_ID = 'X-Mini-Client-Id'
const HEADER_TIMESTAMP = 'X-Mini-Timestamp'
const HEADER_NONCE = 'X-Mini-Nonce'
const HEADER_SIGNATURE = 'X-Mini-Signature'

function utf8Encode(input: string) {
  const bytes: number[] = []
  for (let i = 0; i < input.length; i += 1) {
    let codePoint = input.charCodeAt(i)
    if (codePoint >= 0xd800 && codePoint <= 0xdbff && i + 1 < input.length) {
      const next = input.charCodeAt(i + 1)
      if (next >= 0xdc00 && next <= 0xdfff) {
        codePoint = ((codePoint - 0xd800) << 10) + (next - 0xdc00) + 0x10000
        i += 1
      }
    }

    if (codePoint <= 0x7f) {
      bytes.push(codePoint)
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >> 6))
      bytes.push(0x80 | (codePoint & 0x3f))
    } else if (codePoint <= 0xffff) {
      bytes.push(0xe0 | (codePoint >> 12))
      bytes.push(0x80 | ((codePoint >> 6) & 0x3f))
      bytes.push(0x80 | (codePoint & 0x3f))
    } else {
      bytes.push(0xf0 | (codePoint >> 18))
      bytes.push(0x80 | ((codePoint >> 12) & 0x3f))
      bytes.push(0x80 | ((codePoint >> 6) & 0x3f))
      bytes.push(0x80 | (codePoint & 0x3f))
    }
  }
  return bytes
}

function rightRotate(value: number, amount: number) {
  return (value >>> amount) | (value << (32 - amount))
}

export function sha256Hex(input: string) {
  const bytes = utf8Encode(input)
  const bitLength = bytes.length * 8

  bytes.push(0x80)
  while ((bytes.length % 64) !== 56) {
    bytes.push(0)
  }

  const highBits = Math.floor(bitLength / 0x100000000)
  const lowBits = bitLength >>> 0
  for (let shift = 24; shift >= 0; shift -= 8) {
    bytes.push((highBits >>> shift) & 0xff)
  }
  for (let shift = 24; shift >= 0; shift -= 8) {
    bytes.push((lowBits >>> shift) & 0xff)
  }

  const hash = [
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19
  ]

  const k = [
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
  ]

  const words = new Array<number>(64)
  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      const base = offset + i * 4
      words[i] = (
        (bytes[base] << 24) |
        (bytes[base + 1] << 16) |
        (bytes[base + 2] << 8) |
        bytes[base + 3]
      ) >>> 0
    }

    for (let i = 16; i < 64; i += 1) {
      const s0 = rightRotate(words[i - 15], 7) ^ rightRotate(words[i - 15], 18) ^ (words[i - 15] >>> 3)
      const s1 = rightRotate(words[i - 2], 17) ^ rightRotate(words[i - 2], 19) ^ (words[i - 2] >>> 10)
      words[i] = (words[i - 16] + s0 + words[i - 7] + s1) >>> 0
    }

    let [a, b, c, d, e, f, g, h] = hash

    for (let i = 0; i < 64; i += 1) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
      const choice = (e & f) ^ (~e & g)
      const temp1 = (h + s1 + choice + k[i] + words[i]) >>> 0
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
      const majority = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (s0 + majority) >>> 0

      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    hash[0] = (hash[0] + a) >>> 0
    hash[1] = (hash[1] + b) >>> 0
    hash[2] = (hash[2] + c) >>> 0
    hash[3] = (hash[3] + d) >>> 0
    hash[4] = (hash[4] + e) >>> 0
    hash[5] = (hash[5] + f) >>> 0
    hash[6] = (hash[6] + g) >>> 0
    hash[7] = (hash[7] + h) >>> 0
  }

  return hash.map((part) => part.toString(16).padStart(8, '0')).join('')
}

export function stableStringify(value: JsonValue | undefined): string {
  if (value === undefined) {
    return ''
  }
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }
  const keys = Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort()
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`
}

function stringifyQueryValue(value: JsonValue | undefined) {
  if (value === undefined || value === null) {
    return ''
  }
  if (typeof value === 'object') {
    return stableStringify(value)
  }
  return String(value)
}

export function buildCanonicalQuery(data?: Record<string, JsonValue | undefined>) {
  if (!data) {
    return ''
  }

  const pairs: string[] = []
  Object.keys(data).sort().forEach((key) => {
    const value = data[key]
    if (value === undefined) {
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(stringifyQueryValue(item))}`)
      })
      return
    }
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(stringifyQueryValue(value))}`)
  })
  return pairs.join('&')
}

function buildSignature(method: string, requestPath: string, query: string, body: string, timestamp: string, nonce: string) {
  const clientId = getMiniAppClientId()
  const secret = getMiniAppSharedSecret()
  const payload = [
    clientId,
    timestamp,
    nonce,
    method.toUpperCase(),
    requestPath,
    query,
    sha256Hex(body),
    secret
  ].join('\n')
  return sha256Hex(payload)
}

function createNonce() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export function buildMiniAppSignatureHeaders(method: string, requestPath: string, query: string, body: string) {
  const timestamp = String(Date.now())
  const nonce = createNonce()
  return {
    [HEADER_CLIENT_ID]: getMiniAppClientId(),
    [HEADER_TIMESTAMP]: timestamp,
    [HEADER_NONCE]: nonce,
    [HEADER_SIGNATURE]: buildSignature(method, requestPath, query, body, timestamp, nonce)
  }
}
