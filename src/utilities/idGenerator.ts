import { randomBytes } from 'crypto';

const alphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzric';

// This function generates a random string of length 16.
// It uses the randomBytes function to generate an array of random bytes.
// The array is then mapped using the alphabet array and bitwise AND operation.
// Finally, the mapped values are joined together to form a string.
const generate = () => [...randomBytes(16)].map((b) => alphabet[b & 63]).join('');

export default generate;
