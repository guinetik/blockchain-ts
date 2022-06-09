import * as crypto from 'crypto';

export class Cryptomodel {
    get hash() {
        return Cryptomodel.hashValue(JSON.stringify(this))
    }
    toString() {
        return JSON.stringify(this);
    }

    static hashValue(value: any): string {
        // SHA256 stands for Secure Hash Algorithm with length of 256 bits.
        // It is known as a one-way hashing function, where you can encrypt data, but not reverse to the original form.
        const hash = crypto.createHash('SHA256');
        hash.update(value).end();
        // return the hash digest as hex string
        return hash.digest('hex');
    }

    static md5Digest(value: any) {
        const hash = crypto.createHash('MD5');
        hash.update(value).end();
        return hash.digest('hex');
    }
}   