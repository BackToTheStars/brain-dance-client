// let API_URL = '';
// if (typeof process !== 'undefined' && process.env.API_URL) {
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
// }

export { API_URL };
