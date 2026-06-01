import { decryptSaDriversLicence } from './saDriversLicenceDecryptor';

/**
 * SA Identity Document & Vehicle Licence Disc Barcode Parser
 *
 * Handles:
 *  1. SA Green ID Book   – pipe-delimited ASCII barcode
 *  2. Bare 13-digit ID   – just the ID number
 *  3. SA Driver's Licence – 720-byte RSA-encrypted binary PDF417
 *  4. SA Vehicle Licence Disc – PDF417, RSA-encrypted, best-effort parsing
 */

export type ParsedIdDocument = {
    /** The detected document type */
    type: 'green_id' | 'drivers_licence' | 'id_number_only' | 'unknown';
    /** SA ID number (13 digits) if extractable */
    idNumber?: string;
    /** Surname */
    surname?: string;
    /** Initials (backward-compat) or given names abbreviation */
    initials?: string;
    /** Full given / first names if available (Green ID or fuzzy extraction) */
    firstName?: string;
    /** Date of birth derived from ID number, format YYYY-MM-DD */
    dateOfBirth?: string;
    /** Gender derived from the 7th digit of the ID number */
    gender?: 'Male' | 'Female';
    /** Nationality if available (Green ID) */
    nationality?: string;
    /**
     * True if a driver's licence was detected but not all fields could be
     * extracted — caller should prompt user to fill in manually.
     */
    partialDriversLicence?: boolean;
    /**
     * True if the name was extracted via fuzzy ASCII matching (may be imperfect).
     */
    fuzzyName?: boolean;
};

/**
 * Returns true when the raw scan string looks like a South African driver's
 * licence binary payload: it will be long (≥ 200 chars), contain many
 * non-printable / high-byte characters, and include a 13-digit ID.
 */
function looksLikeDriversLicence(raw: string): boolean {
    if (raw.length < 200) return false;
    // Count non-printable / high-code-point characters
    let highChars = 0;
    for (let i = 0; i < Math.min(raw.length, 300); i++) {
        if (raw.charCodeAt(i) > 127 || raw.charCodeAt(i) < 9) highChars++;
    }
    // Driver's licence binary will have many high-code-point characters
    return highChars > 10;
}

/**
 * Attempts to find a 13-digit SA ID number in the raw scan string.
 * The ID number lives inside the ASCII string section of the barcode,
 * so it's often readable even without decryption.
 */
function extractIdNumberFromRaw(raw: string): string | undefined {
    // Typical SA ID: starts with year (0-9), followed by 12 more digits
    const match = raw.match(/\b(\d{13})\b/);
    return match ? match[1] : undefined;
}

/**
 * Fuzzy surname + given-name extractor for encrypted driver's licence / Smart ID.
 *
 * SA driver's licence PDF417 barcodes are RSA-encrypted by the DoT, but the
 * raw byte stream often contains the holder's SURNAME and GIVEN NAMES in
 * plaintext ASCII within the TLV structure.
 *
 * SA field order (SALIC spec):
 *   ID-number → birth-date → gender → nationality → country → SURNAME → GIVEN-NAMES
 *
 * Strategy:
 *   1. Extract all uppercase-only word tokens with their byte positions.
 *   2. Filter out known metadata tokens (gender / nationality / country values).
 *   3. Find the best ADJACENT PAIR of tokens: both plausible names, both close
 *      together in bytes (≤ 80-byte gap = adjacent TLV fields).
 *   4. In SA documents the first field of the pair is always SURNAME.
 *   5. Fall back to best single token if no good pair is found.
 */
function scoreName(word: string): number {
    if (word.length < 2 || word.length > 25) return 0;
    if (/^(.)\1+$/.test(word)) return 0;      // repeated-char: "AA", "BB" …
    let score = word.length;
    if (word.length >= 3 && word.length <= 15) score += 4;  // sweet-spot for names
    if (word.includes('-')) score += 3;        // hyphenated SA surnames common
    if (word.length <= 2) score -= 6;          // penalise short abbrevs
    return Math.max(0, score);
}

function extractNameFromBinary(raw: string): { surname: string; givenNames: string } | undefined {
    // Expanded blacklist — covers all SA TLV metadata values that appear
    // between the ID number and the name fields:
    // gender, nationality, citizenship status, country codes, prefix titles, etc.
    const BLACKLIST = new Set([
        'RSA', 'SA', 'ZA', 'ZAF', 'DL', 'ID', 'NR', 'PDF', 'TMP', 'VIN',
        'NCA', 'DOT', 'LIC', 'DRV', 'PDP', 'REG',
        'AFRICA', 'SOUTH', 'REPUBLIC',
        'MALE', 'FEMALE', 'GENDER',
        'CITIZEN', 'PERMANENT', 'RESIDENT', 'TEMPORARY', 'ASYLUM',
        'MS', 'MR', 'DR', 'MRS', 'PROF', 'REV', 'ADV',
        'YES', 'NO', 'NULL', 'NONE',
    ]);

    // ── Step 1: collect printable-ASCII runs with their start byte positions ──
    interface Run { text: string; start: number }
    const runs: Run[] = [];
    let cur = '';
    let curStart = 0;
    for (let i = 0; i < raw.length; i++) {
        const code = raw.charCodeAt(i);
        if (code >= 32 && code <= 126) {
            if (cur.length === 0) curStart = i;
            cur += raw[i];
        } else {
            if (cur.length >= 2) runs.push({ text: cur, start: curStart });
            cur = '';
        }
    }
    if (cur.length >= 2) runs.push({ text: cur, start: curStart });

    // ── Step 2: extract uppercase-alpha tokens with absolute byte positions ──
    const NAME_WORD = /\b([A-Z]{2,25}(?:-[A-Z]{2,20})*)\b/g;
    interface Candidate { word: string; pos: number; end: number }
    const candidates: Candidate[] = [];

    for (const run of runs) {
        let m: RegExpExecArray | null;
        NAME_WORD.lastIndex = 0;
        while ((m = NAME_WORD.exec(run.text)) !== null) {
            const word = m[1];
            if (BLACKLIST.has(word)) continue;
            if (/^(.)\1+$/.test(word)) continue;
            const absPos = run.start + m.index;
            candidates.push({ word, pos: absPos, end: absPos + word.length });
        }
    }

    if (candidates.length === 0) return undefined;

    // ── Step 3: sort by byte position, anchor to after the ID number ──
    candidates.sort((a, b) => a.pos - b.pos);

    const idMatch = raw.match(/\b(\d{13})\b/);
    const idPos   = idMatch ? raw.indexOf(idMatch[1]) : 0;

    // Name fields in SA TLV appear within ~400 bytes after the ID number
    const afterId = candidates.filter(c => c.pos > idPos + 13 && c.pos < idPos + 450);
    const pool    = afterId.length >= 1 ? afterId : candidates.filter(c => c.pos > idPos);
    const fallback = pool.length >= 1 ? pool : candidates;

    // Deduplicate consecutive identical tokens
    const unique: Candidate[] = [];
    for (const c of fallback) {
        if (unique.length === 0 || c.word !== unique[unique.length - 1].word) {
            unique.push(c);
        }
    }

    // ── Step 4: find the best adjacent PAIR (surname + given names) ──
    // Score every [i, j] pair where j comes right after i in position order
    // and the byte gap between end-of-i and start-of-j is ≤ 80 bytes.
    // (Adjacent TLV fields in the SA binary are typically 0–40 bytes apart.)
    const MAX_PAIR_GAP = 80;
    let bestSurname    = '';
    let bestGivenNames = '';
    let bestPairScore  = -1;

    for (let i = 0; i < unique.length - 1; i++) {
        const a = unique[i];
        for (let j = i + 1; j < unique.length; j++) {
            const b = unique[j];
            const gap = b.pos - a.end;
            if (gap > MAX_PAIR_GAP) break; // tokens too far apart

            const aScore = scoreName(a.word);
            const bScore = scoreName(b.word);
            if (aScore <= 0 || bScore <= 0) continue;

            // Proximity bonus: closer tokens score higher (adjacent fields)
            const proximityBonus = Math.max(0, (MAX_PAIR_GAP - gap) / 10);
            const pairScore = aScore + bScore + proximityBonus;

            if (pairScore > bestPairScore) {
                bestPairScore  = pairScore;
                bestSurname    = a.word;   // first in byte order = SURNAME
                bestGivenNames = b.word;   // second in byte order = GIVEN NAMES
            }
        }
    }

    // ── Step 5: fallback — best single token as surname if no good pair found ──
    if (!bestSurname) {
        const best = unique.reduce<Candidate | null>(
            (prev, curr) => (scoreName(curr.word) > scoreName(prev?.word ?? '')) ? curr : prev,
            null
        );
        if (best && scoreName(best.word) > 0) bestSurname = best.word;
    }

    console.log(
        '[PARSER FuzzyName] Pool:',
        unique.slice(0, 8).map(c => `${c.word}@${c.pos}`),
        '→ surname:', bestSurname,
        '| givenNames:', bestGivenNames,
    );

    if (!bestSurname || bestSurname.length < 2) return undefined;

    return { surname: bestSurname, givenNames: bestGivenNames };
}

/**
 * Validates that a string is a plausible SA ID number:
 *  - exactly 13 digits
 *  - first 6 digits form a valid YYMMDD date
 *  - 7th digit is gender (0-4 = female, 5-9 = male)
 */
function isValidSaIdNumber(id: string): boolean {
    if (!/^\d{13}$/.test(id)) return false;
    const month = parseInt(id.substring(2, 4), 10);
    const day = parseInt(id.substring(4, 6), 10);
    return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

/**
 * Derives date of birth and gender from a valid 13-digit SA ID number.
 * Format: YYMMDD GGGGG C ZZZ
 *   YYMMDD  – date of birth
 *   GGGGG   – 0000-4999 = Female, 5000-9999 = Male
 *   C       – citizenship (0 = citizen, 1 = permanent resident)
 */
function deriveIdDetails(idNumber: string): { dateOfBirth: string; gender: 'Male' | 'Female' } | undefined {
    if (!isValidSaIdNumber(idNumber)) return undefined;
    const yy = idNumber.substring(0, 2);
    const mm = idNumber.substring(2, 4);
    const dd = idNumber.substring(4, 6);
    const genderDigit = parseInt(idNumber[6], 10);
    const yyInt = parseInt(yy, 10);
    const currentYearShort = new Date().getFullYear() % 100;
    // If yy > (currentYear + 5), assume 1900s; otherwise 2000s
    const century = yyInt > currentYearShort + 5 ? '19' : '20';
    return {
        dateOfBirth: `${century}${yy}-${mm}-${dd}`,
        gender: genderDigit >= 5 ? 'Male' : 'Female',
    };
}

/**
 * Main entry point.  Pass the raw string returned by expo-camera's
 * `onBarcodeScanned` callback.
 */
export function parseSaIdDocument(raw: string): ParsedIdDocument {
    const trimmed = raw.trim();

    console.log('[PARSER] Length:', trimmed.length, '| Has pipe:', trimmed.includes('|'));

    // ── 1. Bare 13-digit SA ID number ─────────────────────────────────────
    if (/^\d{13}$/.test(trimmed) && isValidSaIdNumber(trimmed)) {
        const details = deriveIdDetails(trimmed);
        return { type: 'id_number_only', idNumber: trimmed, ...details };
    }

    // ── 2. SA Driver's Licence / Smart ID (binary PDF417) — CHECK FIRST ─────
    if (looksLikeDriversLicence(trimmed)) {
        // Try precise decryption first (Driver's Licence)
        const decrypted = decryptSaDriversLicence(trimmed);
        if (decrypted) {
            console.log('[PARSER] Driver\'s Licence — decrypted EXACTLY');
            return {
                type: 'drivers_licence',
                idNumber: decrypted.idNumber,
                surname: decrypted.surname,
                initials: decrypted.initials,
                firstName: decrypted.initials, // fallback mapping
                partialDriversLicence: false,
                fuzzyName: false,
                dateOfBirth: decrypted.dateOfBirth,
                gender: decrypted.gender,
            };
        }

        // Fallback to fuzzy extraction
        const idNumber = extractIdNumberFromRaw(trimmed);
        if (idNumber && isValidSaIdNumber(idNumber)) {
            const fuzzy = extractNameFromBinary(trimmed);
            const details = deriveIdDetails(idNumber);
            console.log('[PARSER] Driver\'s Licence — encrypted', fuzzy ? '| fuzzy name: ' + fuzzy.surname : '| name not extractable');
            return {
                type: 'drivers_licence',
                idNumber,
                surname: fuzzy?.surname,
                initials: fuzzy?.givenNames,
                firstName: fuzzy?.givenNames,
                partialDriversLicence: !fuzzy?.surname,
                fuzzyName: !!fuzzy?.surname,
                ...details,
            };
        }
    }

    // ── 3. SA Green ID book barcode ─────────────────────────────────────────
    // Format: idNumber|surname|names|gender|nationality|...
    if (trimmed.length > 20) {
        // Try all known separators
        for (const sep of ['|', '^', '\r\n', '\n', '\r', '\x1c', '\x0d', '\x0a', '\x1e']) {
            if (trimmed.includes(sep)) {
                const parts = trimmed.split(sep).map(p => p.trim()).filter(Boolean);
                if (parts.length >= 2) {
                    const idPart = parts.find(p => /^\d{13}$/.test(p.replace(/\D/g, '')) && isValidSaIdNumber(p.replace(/\D/g, '')));
                    const idNumber = idPart ? idPart.replace(/\D/g, '') : parts[0]?.replace(/\D/g, '');
                    const idIdx = idPart ? parts.indexOf(idPart) : 0;
                    const surname = parts[idIdx + 1] || '';
                    // Field 3 in Green ID is full given names (not just initials)
                    const givenNames = parts[idIdx + 2] || '';
                    const nationality = parts[idIdx + 4] || undefined;
                    const details = idNumber && isValidSaIdNumber(idNumber) ? deriveIdDetails(idNumber) : undefined;

                    console.log('[PARSER] Green ID — sep:', JSON.stringify(sep), '| surname:', surname, '| names:', givenNames);

                    return {
                        type: 'green_id',
                        idNumber: idNumber && isValidSaIdNumber(idNumber) ? idNumber : undefined,
                        surname: surname || undefined,
                        initials: givenNames || undefined,
                        firstName: givenNames || undefined,
                        nationality: nationality || undefined,
                        ...details,
                    };
                }
            }
        }

        // Some green IDs use char-225 (á/à) as a field separator
        if (/[áà]/.test(trimmed)) {
            const parts = trimmed.split(/[áà]/).map(p => p.trim()).filter(Boolean);
            const candidateId = parts.find(p => /^\d{13}$/.test(p));
            if (candidateId) {
                const details = deriveIdDetails(candidateId);
                return {
                    type: 'green_id',
                    idNumber: candidateId,
                    surname: parts[1] || undefined,
                    initials: parts[2] || undefined,
                    firstName: parts[2] || undefined,
                    ...details,
                };
            }
        }
    }

    // ── 4. Unknown / other barcode ─────────────────────────────────────────
    return { type: 'unknown' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Licence Disc Parser
// ─────────────────────────────────────────────────────────────────────────────

export type ParsedLicenceDisc = {
    /** Whether a licence disc barcode was detected */
    detected: boolean;
    /** SA registration / licence plate number if extractable, e.g. "CA123456" */
    registrationNumber?: string;
    /** Vehicle make if extractable, e.g. "TOYOTA" */
    make?: string;
    /** 17-character VIN if extractable */
    vin?: string;
    /** Licence expiry date string if found, e.g. "2025-08" */
    expiryDate?: string;
};

/**
 * SA registration plate patterns:
 *  - Standard: 2-3 uppercase letters + 1-6 digits + optional 1-2 letters  (e.g. "CA123456", "GP123B")
 *  - Older format: 3 letters + space + 6 digits  (e.g. "CAA 123456")
 */
const SA_REG_REGEX = /\b([A-Z]{2,3}\s?\d{3,6}(?:\s?[A-Z]{1,2})?)\b/g;

/** VIN: 17 uppercase alphanumeric characters (excluding I, O, Q) */
const VIN_REGEX = /\b([A-HJ-NPR-Z0-9]{17})\b/;

/**
 * Best-effort extractor for the registration number —
 * picks the longest match as it's most likely a full plate.
 */
function extractRegistrationNumber(raw: string): string | undefined {
    const matches = [...raw.matchAll(SA_REG_REGEX)].map(m => m[1].replace(/\s/g, ''));
    if (matches.length === 0) return undefined;
    // Prefer the longest match
    return matches.reduce((a, b) => (b.length > a.length ? b : a));
}

function extractVin(raw: string): string | undefined {
    const match = raw.match(VIN_REGEX);
    return match ? match[1] : undefined;
}

/**
 * Detect &amp; parse an SA vehicle licence disc PDF417 barcode.
 * The disc barcode is RSA-encrypted like the driver's licence, so full
 * decryption is not possible without DoT keys. We attempt best-effort
 * extraction of the registration number and VIN from the ASCII segments.
 *
 * @param raw  Raw string from expo-camera onBarcodeScanned
 */
export function parseSaLicenceDisc(raw: string): ParsedLicenceDisc {
    const trimmed = raw.trim();

    // Must be a binary-looking blob to be a licence disc
    if (!looksLikeDriversLicence(trimmed)) {
        return { detected: false };
    }

    const registrationNumber = extractRegistrationNumber(trimmed);
    const vin = extractVin(trimmed);

    // Look for a year-month pattern that could be expiry, e.g. "2025-08" or "08/2025"
    const expiryMatch = trimmed.match(/(20\d{2})[\-\/](0[1-9]|1[0-2])/) ||
                        trimmed.match(/(0[1-9]|1[0-2])[\-\/](20\d{2})/);
    let expiryDate: string | undefined;
    if (expiryMatch) {
        // Normalise to YYYY-MM
        const isYearFirst = /^20/.test(expiryMatch[1]);
        expiryDate = isYearFirst
            ? `${expiryMatch[1]}-${expiryMatch[2]}`
            : `${expiryMatch[2]}-${expiryMatch[1]}`;
    }

    return {
        detected: true,
        registrationNumber,
        vin,
        expiryDate,
    };
}
