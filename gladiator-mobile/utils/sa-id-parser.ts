/**
 * Utility for parsing South African ID card barcode data (PDF417).
 */

export interface SAIDData {
    idNumber: string;
    firstName: string;
    lastName: string;
    gender: string;
    nationality: string;
    dateOfBirth: string;
}

export function parseSAIDBarcode(data: string): SAIDData | null {
    if (!data) return null;

    // SA Smart ID PDF417 data often uses "|" or is a fixed-width format.
    // This is a simplified parser for common smart ID formats.
    const parts = data.split('|');

    // Check if it looks like an SA ID (ID number is usually 13 digits)
    // A real SA ID starts with an ID number
    if (parts.length >= 3 && parts[0].length === 13 && /^\d+$/.test(parts[0])) {
        return {
            idNumber: parts[0],
            lastName: parts[1] || '',
            firstName: parts[2] || '',
            gender: parts[3] || '',
            nationality: parts[4] || 'RSA',
            dateOfBirth: parts[5] || '',
        };
    }

    // Fallback: If it's just a 13-digit string, it's likely just the ID number
    if (data.length === 13 && /^\d+$/.test(data)) {
        return {
            idNumber: data,
            firstName: '',
            lastName: '',
            gender: '',
            nationality: 'RSA',
            dateOfBirth: '',
        };
    }

    return null;
}
