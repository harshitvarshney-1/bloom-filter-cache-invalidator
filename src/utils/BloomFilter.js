const crypto = require('crypto');

class BloomFilter {
  /**
   * @param {number} size - Size of the bit array (m)
   * @param {number} numHashes - Number of hash functions (k)
   */
  constructor(size = 1000, numHashes = 3) {
    this.size = size;
    this.numHashes = numHashes;
    // Int32Array holds 32 bits per element. Math.ceil(size / 32)
    this.bitArray = new Int32Array(Math.ceil(size / 32)); 
  }

  /**
   * Generates k hash values for a given key
   * @param {string} key 
   * @returns {number[]} Array of positions to set/check
   */
  getHashValues(key) {
    const positions = [];
    const hash1 = this.fnv1a(key);
    const hash2 = this.murmur3(key); // Using a numeric hash or simplified version
    
    for (let i = 0; i < this.numHashes; i++) {
        // Double hashing technique: (hash1 + i * hash2) % size
        // Ensure result is positive
        const pos = Math.abs((hash1 + i * hash2) % this.size);
        positions.push(pos);
    }
    return positions;
  }

  /**
   * Adds a key to the Bloom Filter
   * @param {string} key 
   */
  add(key) {
    const positions = this.getHashValues(key);
    positions.forEach(pos => {
      const index = Math.floor(pos / 32);
      const bit = pos % 32;
      this.bitArray[index] |= (1 << bit);
    });
  }

  /**
   * Checks if a key is likely in the Bloom Filter
   * @param {string} key 
   * @returns {boolean} True if possibly present, False if definitely not
   */
  contains(key) {
    const positions = this.getHashValues(key);
    for (const pos of positions) {
      const index = Math.floor(pos / 32);
      const bit = pos % 32;
      if ((this.bitArray[index] & (1 << bit)) === 0) {
        return false; // Definitely not present
      }
    }
    return true; // Possibly present
  }
  fnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash;
  }
  murmur3(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    return hash;
  }

  // Debugging/Demo: Get memory usage approximation
  getMemoryUsage() {
    return `${this.bitArray.byteLength} bytes`;
  }
}

module.exports = BloomFilter;
