const CODE_PREFIX = 'p';
const CODE_PAYLOAD_LENGTH = 9;
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = BigInt(ALPHABET.length);
const SAFE_INTEGER_MODULUS = 1n << 53n;
const SAFE_INTEGER_MASK = SAFE_INTEGER_MODULUS - 1n;
const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

// These constants are part of the permanent public URL contract. This reversible
// permutation obscures sequential IDs; it is not encryption or access control.
const MULTIPLIER = 6364136223846793n;
const MULTIPLIER_INVERSE = 700485613720761n;
const OFFSET = 1442695040888963n;

const toSupportedPostId = (value) => {
  let postId;

  if (typeof value === 'bigint') {
    postId = value;
  } else if (typeof value === 'number' && Number.isSafeInteger(value)) {
    postId = BigInt(value);
  } else if (typeof value === 'string' && /^[1-9]\d*$/.test(value)) {
    postId = BigInt(value);
  } else {
    throw new TypeError('Post ID must be a positive safe integer');
  }

  if (postId <= 0n || postId > MAX_SAFE_INTEGER) {
    throw new RangeError('Post ID must be a positive safe integer');
  }

  return postId;
};

const encodeBase62 = (value) => {
  let remaining = value;
  let encoded = '';

  do {
    encoded = ALPHABET[Number(remaining % BASE)] + encoded;
    remaining /= BASE;
  } while (remaining > 0n);

  return encoded.padStart(CODE_PAYLOAD_LENGTH, ALPHABET[0]);
};

const decodeBase62 = (value) => {
  let decoded = 0n;

  for (const character of value) {
    const digit = ALPHABET.indexOf(character);
    if (digit < 0) return undefined;
    decoded = decoded * BASE + BigInt(digit);
  }

  return decoded;
};

/**
 * @param {number | string | bigint} postId
 * @returns {string}
 */
export const encodePublicPostId = (postId) => {
  const source = toSupportedPostId(postId);
  const permuted = (source * MULTIPLIER + OFFSET) & SAFE_INTEGER_MASK;
  return `${CODE_PREFIX}${encodeBase62(permuted)}`;
};

/**
 * @param {unknown} code
 * @returns {string | undefined}
 */
export const decodePublicPostCode = (code) => {
  if (
    typeof code !== 'string' ||
    code.length !== CODE_PREFIX.length + CODE_PAYLOAD_LENGTH ||
    !code.startsWith(CODE_PREFIX)
  ) {
    return undefined;
  }

  const permuted = decodeBase62(code.slice(CODE_PREFIX.length));
  if (permuted === undefined || permuted > SAFE_INTEGER_MASK) return undefined;

  const source =
    (((permuted - OFFSET) & SAFE_INTEGER_MASK) * MULTIPLIER_INVERSE) & SAFE_INTEGER_MASK;
  if (source <= 0n || source > MAX_SAFE_INTEGER) return undefined;

  const postId = source.toString();
  return encodePublicPostId(postId) === code ? postId : undefined;
};

/**
 * @param {number | string | bigint} postId
 * @returns {string}
 */
export const toPublicPostPath = (postId) => `/blog/${encodePublicPostId(postId)}`;

/**
 * @typedef {{ id: string, canonicalPath: string, legacy: boolean }} PublicPostRoute
 */

/**
 * @param {unknown} segment
 * @returns {PublicPostRoute | undefined}
 */
export const resolvePublicPostRouteSegment = (segment) => {
  if (typeof segment !== 'string') return undefined;

  if (/^[1-9]\d*$/.test(segment)) {
    try {
      const canonicalPath = toPublicPostPath(segment);
      return { id: segment, canonicalPath, legacy: true };
    } catch {
      return undefined;
    }
  }

  const id = decodePublicPostCode(segment);
  return id ? { id, canonicalPath: toPublicPostPath(id), legacy: false } : undefined;
};
