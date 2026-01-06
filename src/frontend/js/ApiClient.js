/**
 * API Client wrapper for handling rate limiting and common fetch operations
 */

import { showToast } from '../components/Toast.js';

/**
 * Handle rate limit (429) response
 * @param {Response} response - The fetch response
 * @returns {boolean} - True if rate limited
 */
function handleRateLimit(response) {
    if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after') || 60;
        showToast(`Too many requests. Please try again in ${retryAfter} seconds.`, 'error');
        return true;
    }
    return false;
}

/**
 * Enhanced fetch wrapper with rate limit handling
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 * @throws {Error} - If rate limited or other error
 */
export async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        ...options
    });

    if (handleRateLimit(response)) {
        throw new Error('Rate limit exceeded');
    }

    return response;
}

/**
 * Check if an error is a rate limit error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if rate limit error
 */
export function isRateLimitError(error) {
    return error && error.status === 429;
}

/**
 * Get retry after seconds from a rate limit error
 * @param {Error} error - The rate limit error
 * @returns {number} - Seconds to wait
 */
export function getRetryAfter(error) {
    return error && error.retryAfter ? error.retryAfter : 60;
}

export default apiFetch;
