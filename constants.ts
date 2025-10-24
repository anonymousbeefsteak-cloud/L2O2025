import type { MenuItem } from './types';

export const LIFF_ID = '2008316489-6nMjb0KX';

// Obfuscate API endpoint to protect it from scrapers
const OBFUSCATED_API_ENDPOINT = 'aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6ZF9jVnRlWFoxQ2xpdGV6bXhPRDRkSzNCWHBjOTl1ZXJGc29aWThyb0FRZE9NY1c2YktlT1hOMEgyZWswODc2eFEvZXhlYw==';
export const API_ENDPOINT = atob(OBFUSCATED_API_ENDPOINT);

// Obfuscated API Key for backend validation
const OBFUSCATED_API_KEY = 'Z2VuLWxhbmctY2xpZW50LTA4MDAzMzE4Mzk=';
export const API_KEY = atob(OBFUSCATED_API_KEY);


export const DELIVERY_FEE = 30;

export const MENU_ITEMS: MenuItem[] = [
    { name: '滷肉飯', price: 35, icon: '🍚' },
    { name: '雞肉飯', price: 40, icon: '🍗' },
    { name: '蚵仔煎', price: 65, icon: '🍳' },
    { name: '大腸麵線', price: 50, icon: '🍜' },
    { name: '珍珠奶茶', price: 45, icon: '🥤' },
    { name: '鹽酥雞', price: 60, icon: '🍖' },
    { name: '甜不辣', price: 40, icon: '🍢' },
    { name: '肉圓', price: 45, icon: '🥟' }
];