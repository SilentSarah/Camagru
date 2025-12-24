/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 */

import FetchCSRF from '../../../../js/Csrf.js';
import { getCookie } from '../../../../js/Utils.js';
import { PhotoCompositor } from '../../../../utils/PhotoCompositor.js';
import { showToast } from '../../../Toast.js';

/**
 * Process image with stickers/filters via backend PHP GD
 * Backend handles both static images (PNG, JPG) and animated GIFs
 * @param {string} imageDataUrl - The original image as base64 data URL
 * @param {Array} stickerData - Array of sticker objects with positions/scales
 * @param {string} filterCss - CSS filter string to apply
 * @param {PhotoCompositor} compositor - The PhotoCompositor instance (for fallback)
 * @returns {Promise<string>} - URL of processed image
 */
export const processImageWithStickers = async (imageDataUrl, stickerData, filterCss, compositor) => {
    const formData = new FormData();
    
    // Add the image data (base64 string)
    formData.append('image', imageDataUrl);
    
    // Add filter data
    formData.append('filter', filterCss);
    
    // Prepare sticker data for backend
    // Each sticker needs: type, emoji/imageUrl, x, y, scale
    const stickersForBackend = stickerData.map(s => ({
        type: s.type || 'emoji',
        emoji: s.emoji || null,
        imageUrl: s.imageUrl || null,
        x: s.x,           // Relative position (0-1)
        y: s.y,           // Relative position (0-1)
        // Calculate scale relative to the visual canvas width
        // 128 is the base width of the sticker (w-32 = 8rem = 128px)
        scale: ((128 * (s.scale || 1)) / (compositor.canvas.offsetWidth || 500))
    }));
    formData.append('stickers', JSON.stringify(stickersForBackend));
    
    // Add canvas dimensions for scale reference
    formData.append('canvasWidth', compositor.canvas.width.toString());
    formData.append('canvasHeight', compositor.canvas.height.toString());
    
    try {
        const response = await fetch('http://localhost:8000/index.php/process-image', {
            method: 'POST',
            credentials: 'include',
            headers: {
                "X-CSRF-TOKEN": await FetchCSRF(),
                "Authorization": `Bearer ${getCookie('session_token')}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Image processing failed');
        }

        const retJson = await response.json();
        return retJson.image;
    } catch (error) {
        console.error('Image processing error:', error);
        showToast('Failed to process image', 'error');
        
        // Fallback to canvas baking for static images
        await compositor.bakeStickers(stickerData);
        return compositor.export();
    }
};
