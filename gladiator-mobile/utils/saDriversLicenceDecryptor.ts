/**
 * SA Driver's Licence Decryptor
 * 
 * Uses RSA decryption with known SA DoT public keys to decode the PDF417 payload.
 * Leverages native JS BigInt for math (no extra dependencies).
 */

// --- BigInt RSA Math ---

/** Modular exponentiation: (base^exp) % mod */
function expMod(base: bigint, exp: bigint, mod: bigint): bigint {
    let res = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % mod;
        exp = exp / 2n;
        base = (base * base) % mod;
    }
    return res;
}

/** Convert a byte array to a BigInt */
function bytesToBigInt(bytes: Uint8Array): bigint {
    let hex = '0x';
    for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
    }
    return BigInt(hex);
}

/** Convert a BigInt back to a byte array of fixed length */
function bigIntToBytes(num: bigint, length: number): Uint8Array {
    let hex = num.toString(16);
    if (hex.length % 2 !== 0) hex = '0' + hex; // Pad to even length
    const bytes = new Uint8Array(length);
    let hexIndex = hex.length - 2;
    for (let i = length - 1; i >= 0; i--) {
        if (hexIndex >= 0) {
            bytes[i] = parseInt(hex.substring(hexIndex, hexIndex + 2), 16);
            hexIndex -= 2;
        } else {
            bytes[i] = 0;
        }
    }
    return bytes;
}

// --- Keys ---

// V1 Keys
const V1_128_N = 0xfed2e1c27e3363316e77317a7a52c54981395186be4974760c72518d63e0544a48d088b332c5b0c370c765d65d983c1f9de0a42b310ccc07ae770bd2b61d6a4dcceac757689bdcbf608478faf312f6087cc496c3762cf5c4651caecda3499fae7edb7eb40e3e18eb304170e91ed5b156aace6f432d6eca6cc35851de8c678f67n;
const V1_128_E = 0xbb797ffdec7f9e42c9d6f79b137059dbn;
const V1_74_N = 0xff3cec6b5f40e3c3661451b9fcfaef3aeb06dc2329c0e6f4dccc9279726716ce15bbe05eed2c5711bcf8f5b6c8f7276db5c43bfaa3040dc01ab14b9c4d16f71c0ce5ea953f0c754c6b17n;
const V1_74_E = 0xdb05ba822d9acc33fab7d8f427f9ce65n;

// V2 Keys
const V2_128_N = 0xca9f18ef6c3f3fa4c5a461fea54ab19406ba5ecd746d60a27492dca3d74e3b5c1d315f7b10383241809b029ebbd5de4d116030cc57f7d5a6c9a16f373bb14a508523f7e80a4c744d9085663a4a1472d7af2c56ae41b5065f7efa0293bd3278ad693546f9f16219b79ff471a3636824cffcdb63a8ed8059e6b9a4f0db895381cbn;
const V2_128_E = 0x187092da6454ceb1853e6915f8466a05n;
const V2_74_N = 0xb404a0df11d1cacff1a1a048d4d573f953a62c583d74925927561a6d7a1e2b14042526af70b550547390ea6ec748d30fdb81adb490e0c36a1986b404b2f5f69ef5da1b663e59509130e7n;
const V2_74_E = 0x309cfed9719fe2a5e20c9bb44765382bn;

// --- Parser ---

export type DecodedDriversLicence = {
    surname: string;
    initials: string;
    idNumber: string;
    gender: 'Male' | 'Female';
    dateOfBirth: string; // YYYY-MM-DD
    licenseNumber: string;
    vehicleCodes: string[];
};

export function decryptSaDriversLicence(rawString: string): DecodedDriversLicence | null {
    if (rawString.length < 720) return null;

    // The raw string from the scanner contains 720 binary bytes disguised as characters.
    // Convert them to actual bytes safely.
    const data = new Uint8Array(720);
    for (let i = 0; i < 720; i++) {
        data[i] = rawString.charCodeAt(i) & 0xFF;
    }

    const header = data.slice(0, 6);
    let n128: bigint, e128: bigint, n74: bigint, e74: bigint;

    // Detect version
    if (header[0] === 0x01 && header[1] === 0xe1 && header[2] === 0x02 && header[3] === 0x45) {
        n128 = V1_128_N; e128 = V1_128_E;
        n74 = V1_74_N; e74 = V1_74_E;
    } else if (header[0] === 0x01 && header[1] === 0x9b && header[2] === 0x09 && header[3] === 0x45) {
        n128 = V2_128_N; e128 = V2_128_E;
        n74 = V2_74_N; e74 = V2_74_E;
    } else {
        // Unknown version / not an SA DL
        console.warn(`[Decrypt] Unknown version bytes: ${header[0].toString(16)} ${header[1].toString(16)}`);
        return null;
    }

    try {
        const decrypted = new Uint8Array(714);
        let outIndex = 0;
        let inIndex = 6;

        // 5 blocks of 128 bytes
        for (let i = 0; i < 5; i++) {
            const block = data.slice(inIndex, inIndex + 128);
            const inputBigInt = bytesToBigInt(block);
            const outputBigInt = expMod(inputBigInt, e128, n128);
            const decryptedBlock = bigIntToBytes(outputBigInt, 128);
            decrypted.set(decryptedBlock, outIndex);
            outIndex += 128;
            inIndex += 128;
        }

        // 1 block of 74 bytes
        const block = data.slice(inIndex, inIndex + 74);
        const inputBigInt = bytesToBigInt(block);
        const outputBigInt = expMod(inputBigInt, e74, n74);
        const decryptedBlock = bigIntToBytes(outputBigInt, 74);
        decrypted.set(decryptedBlock, outIndex);

        return parseDecryptedBinary(decrypted);

    } catch (err) {
        console.error('[Decrypt] Failed to decrypt blocks:', err);
        return null;
    }
}

function readStrings(data: Uint8Array, index: number, length: number): { strings: string[], newIndex: number } {
    const strings: string[] = [];
    let i = 0;
    while (i < length) {
        let value = '';
        while (true) {
            if (index >= data.length) break;
            const currentByte = data[index++];
            if (currentByte === 0xe0) {
                break;
            } else if (currentByte === 0xe1) {
                if (value !== '') i++;
                break;
            }
            value += String.fromCharCode(currentByte);
        }
        i++;
        if (value !== '') {
            strings.push(value);
        }
    }
    return { strings, newIndex: index };
}

function readString(data: Uint8Array, index: number): { value: string, newIndex: number, delimiter: number } {
    let value = '';
    let delimiter = 0xe0;
    while (true) {
        if (index >= data.length) break;
        const currentByte = data[index++];
        if (currentByte === 0xe0 || currentByte === 0xe1) {
            delimiter = currentByte;
            break;
        }
        value += String.fromCharCode(currentByte);
    }
    return { value, newIndex: index, delimiter };
}

function readNibbleDateString(nibbleQueue: number[]): string {
    if (nibbleQueue.length < 9) return '';
    const m = nibbleQueue.shift()!;
    if (m === 10) return '';
    
    const c = nibbleQueue.shift()!;
    const d = nibbleQueue.shift()!;
    const y = nibbleQueue.shift()!;

    const m1 = nibbleQueue.shift()!;
    const m2 = nibbleQueue.shift()!;

    const d1 = nibbleQueue.shift()!;
    const d2 = nibbleQueue.shift()!;
    
    return `${m}${c}${d}${y}-${m1}${m2}-${d1}${d2}`;
}

function parseDecryptedBinary(data: Uint8Array): DecodedDriversLicence | null {
    try {
        let index = 0;
        // Find 0x82 start byte (TLV block start)
        for (let i = 0; i < data.length; i++) {
            if (data[i] === 0x82) {
                index = i;
                break;
            }
        }

        // Section 1: Strings
        index += 2; // skip 0x82 and length?
        let vehicleCodesObj = readStrings(data, index, 4);
        let vehicleCodes = vehicleCodesObj.strings;
        index = vehicleCodesObj.newIndex;

        let surnameObj = readString(data, index);
        let surname = surnameObj.value;
        index = surnameObj.newIndex;

        let initialsObj = readString(data, index);
        let initials = initialsObj.value;
        index = initialsObj.newIndex;
        let delimiter = initialsObj.delimiter;

        if (delimiter === 0xe0) {
            let prdpObj = readString(data, index);
            index = prdpObj.newIndex;
            delimiter = prdpObj.delimiter;
        }

        let idCountryObj = readString(data, index);
        index = idCountryObj.newIndex;

        let licCountryObj = readString(data, index);
        index = licCountryObj.newIndex;

        let vehicleRestsObj = readStrings(data, index, 4);
        index = vehicleRestsObj.newIndex;

        let licNumberObj = readString(data, index);
        let licenseNumber = licNumberObj.value;
        index = licNumberObj.newIndex;

        let idNumber = '';
        for (let i = 0; i < 13; i++) {
            idNumber += String.fromCharCode(data[index++]);
        }

        // Section 2: Binary Data
        const idNumberType = data[index++]; // 02 = SA ID
        
        const nibbleQueue: number[] = [];
        while (index < data.length) {
            const currentByte = data[index++];
            if (currentByte === 0x57) break; // end of binary section
            nibbleQueue.push(currentByte >> 4);
            nibbleQueue.push(currentByte & 0x0f);
        }

        // 4 x license code issue date (either 8 nibbles or 1 nibble if empty)
        for(let i=0; i<4; i++) {
            if (nibbleQueue.length > 0) {
                const m = nibbleQueue[0];
                if (m === 10) {
                    nibbleQueue.shift();
                } else {
                    for(let j=0; j<8; j++) nibbleQueue.shift();
                }
            }
        }

        // driver restriction codes
        if (nibbleQueue.length >= 2) {
            nibbleQueue.shift(); nibbleQueue.shift();
        }

        readNibbleDateString(nibbleQueue); // PrDP permit expiry date
        
        // license issue number
        if (nibbleQueue.length >= 2) {
            nibbleQueue.shift(); nibbleQueue.shift();
        }

        const dateOfBirth = readNibbleDateString(nibbleQueue);
        const licenseIssueDate = readNibbleDateString(nibbleQueue);
        const licenseExpiryDate = readNibbleDateString(nibbleQueue);

        let genderStr: 'Male' | 'Female' = 'Male';
        if (nibbleQueue.length >= 2) {
            const g1 = nibbleQueue.shift()!;
            const g2 = nibbleQueue.shift()!;
            if (g1 === 0 && g2 === 1) genderStr = 'Male';
            else genderStr = 'Female';
        }

        return {
            surname,
            initials,
            idNumber,
            gender: genderStr,
            dateOfBirth,
            licenseNumber,
            vehicleCodes
        };

    } catch (err) {
        console.error('[Decrypt] Error parsing decoded bytes:', err);
        return null;
    }
}
