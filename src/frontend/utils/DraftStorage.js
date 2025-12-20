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
 * File Created: Tuesday, 16th December 2025 11:34:56 am
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

const STORAGE_KEY = 'camagru_drafts';

export const DraftStorage = {
    /**
     * Get all drafts from storage
     * @returns {Array} Array of draft objects
     */
    getDrafts: () => {
        try {
            const drafts = localStorage.getItem(STORAGE_KEY);
            return drafts ? JSON.parse(drafts) : [];
        } catch (e) {
            console.error('Failed to load drafts', e);
            return [];
        }
    },

    /**
     * Save a draft
     * @param {Object} draft - { imageUrl, filter, stickers, timestamp }
     */
    saveDraft: (draft) => {
        try {
            const drafts = DraftStorage.getDrafts();
            const newDraft = {
                id: Date.now(),
                timestamp: Date.now(),
                ...draft
            };
            
            // Keep only last 10 drafts
            const updatedDrafts = [newDraft, ...drafts].slice(0, 10);
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrafts));
            return newDraft;
        } catch (e) {
            console.error('Failed to save draft', e);
            // Handle quota exceeded
            if (e.name === 'QuotaExceededError') {
                // Try to remove oldest drafts
                const drafts = DraftStorage.getDrafts();
                if (drafts.length > 1) {
                    const smallerList = drafts.slice(0, Math.ceil(drafts.length / 2));
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(smallerList));
                    return DraftStorage.saveDraft(draft); // Retry
                }
            }
            return null;
        }
    },

    /**
     * Delete a draft by ID
     * @param {number} id 
     */
    deleteDraft: (id) => {
        const drafts = DraftStorage.getDrafts();
        const updatedDrafts = drafts.filter(d => d.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrafts));
    },

    /**
     * Clear all drafts
     */
    clearDrafts: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
