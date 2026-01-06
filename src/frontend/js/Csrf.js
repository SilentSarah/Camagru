/*
 *   ██████  ▄▄▄       ██▀███   ▄▄▄       ██░ ██ 
 * ▒██    ▒ ▒████▄    ▓██ ▒ ██▒▒████▄    ▓██░ ██▒
 * ░ ▓██▄   ▒██  ▀█▄  ▓██ ░▄█ ▒▒██  ▀█▄  ▒██▀▀██░
 *   ▒   ██▒░██▄▄▄▄██ ▒██▀▀█▄  ░██▄▄▄▄██ ░▓█ ░██ 
 * ▒██████▒▒ ▓█   ▓██▒░██▓ ▒██▒ ▓█   ▓██▒░▓█▒░██▓
 * ▒ ▒▓▒ ▒ ░ ▒▒   ▓▒█░░ ▒▓ ░▒▓░ ▒▒   ▓▒█░ ▒ ░░▒░▒
 * ░ ░▒  ░ ░  ▒   ▒▒ ░  ░▒ ░ ▒░  ▒   ▒▒ ░ ▒ ░▒░ ░
 *  ░  ░  ░    ░   ▒     ░░   ░   ░   ▒    ░  ░░ ░
 * ░        ░  ░   ░           ░  ░ ░  ░  ░
 *                                       
 * File Created: Thursday, 27th November 2025 4:52:09 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { showToast } from '../components/Toast.js';
import apiFetch from './ApiClient.js';

/**
 * Fetches the CSRF token from the server
 * @returns {Promise<String>} The CSRF token
 */
export default async function FetchCSRF() {
    try {
        const response = await apiFetch(`${window.env.APP_URL}index.php/csrf` , {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();
        return data.csrf_token;
    } catch (error) {
        showToast("Couldn't fetch CSRF token, please refresh the page", "error");
        return null;
    }
}