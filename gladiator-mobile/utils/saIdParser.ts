/**
 * SA Identity Document &amp; Vehicle Licence Disc Barcode Parser
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
    /** Surname (green ID book only) */
    surname?: string;
    /** Name / initials (green ID book only) */
    initials?: string;
    /**
     * True if a driver's licence was detected but not all fields could be
     * extracted — caller should prompt user to fill in manually.
     */
    partialDriversLicence?: boolean;
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
 * Main entry point.  Pass the raw string returned by expo-camera's
 * `onBarcodeScanned` callback.
 */
export function parseSaIdDocument(raw: string): ParsedIdDocument {
    const trimmed = raw.trim();

    // ── 1. Bare 13-digit SA ID number ─────────────────────────────────────
    if (/^\d{13}$/.test(trimmed) && isValidSaIdNumber(trimmed)) {
        return { type: 'id_number_only', idNumber: trimmed };
    }

    // ── 2. SA Green ID book barcode (pipe-separated) ───────────────────────
    // Format:  <idNumber>|<surname>|<initials>|...  or separated by char 225/224
    if (trimmed.includes('|') && trimmed.length > 20) {
        const parts = trimmed.split('|');
        const idNumber = parts[0]?.replace(/\D/g, '') || '';
        const surname = parts[1]?.trim() || '';
        const initials = parts[2]?.trim() || '';
        return {
            type: 'green_id',
            idNumber: isValidSaIdNumber(idNumber) ? idNumber : undefined,
            surname: surname || undefined,
            initials: initials || undefined,
        };
    }

    // Some green IDs use char-225 (á) as a field separator instead of pipe
    if (trimmed.length > 20 && /[áà]/.test(trimmed)) {
        const parts = trimmed.split(/[áà]/);
        // Fields: vehicleCode, surname, initials, idCountry, licCountry, restriction, licNumber, idNumber
        const candidateId = parts.find(p => /^\d{13}$/.test(p.trim()));
        const surname = parts[1]?.trim();
        const initials = parts[2]?.trim();
        if (candidateId) {
            return {
                type: 'green_id',
                idNumber: candidateId,
                surname: surname || undefined,
                initials: initials || undefined,
            };
        }
    }

    // ── 3. SA Driver's Licence (binary PDF417) ─────────────────────────────
    if (looksLikeDriversLicence(trimmed)) {
        const idNumber = extractIdNumberFromRaw(trimmed);
        return {
            type: 'drivers_licence',
            idNumber: idNumber && isValidSaIdNumber(idNumber) ? idNumber : undefined,
            partialDriversLicence: true,
        };
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
const SA_REG_REGEX = /\b([A-Z]{2,3}\s?\d{3,6}[A-Z]{0,2})\b/g;

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
