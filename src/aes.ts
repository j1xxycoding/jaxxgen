// Slow AES implementation
export const slowAES = {
  decrypt: function(c: number[], b: number, a: number[], f: number[]): number[] {
    // Simple implementation for demo purposes
    return c.map((x, i) => x ^ (a[i % a.length] || 0) ^ (f[i % f.length] || 0));
  }
};