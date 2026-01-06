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
 * File Created: Tuesday, 16th December 2025
 * Author: Camagru Team
 */

/**
 * Helper class to manage canvas operations for image compositing
 */
export class PhotoCompositor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.baseImage = null;
        this.filter = 'none';
        this.stickers = [];
    }

    /**
     * Load an image from URL or data URI
     * @param {string} src - Image source
     * @returns {Promise<void>}
     */
    /**
     * Resize an image data URL if it exceeds max dimensions
     * @param {string} dataUrl 
     * @param {number} maxDim 
     * @returns {Promise<string>} Resized data URL
     */
    static async resizeImage(dataUrl, maxDim = 1280) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width <= maxDim && height <= maxDim) {
                    resolve(dataUrl);
                    return;
                }

                if (width > height) {
                    height = (height / width) * maxDim;
                    width = maxDim;
                } else {
                    width = (width / height) * maxDim;
                    height = maxDim;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

    /**
     * Load an image from URL or data URI
     * @param {string} src - Image source
     * @returns {Promise<void>}
     */
    async loadImage(src) {
        const resizedSrc = await PhotoCompositor.resizeImage(src);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.baseImage = img;
                this.canvas.width = img.naturalWidth || img.width;
                this.canvas.height = img.naturalHeight || img.height;
                this.render();
                resolve();
            };
            img.onerror = reject;
            img.src = resizedSrc;
        });
    }

    /**
     * Load image from video frame
     * @param {HTMLVideoElement} video
     */
    captureFromVideo(video) {
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;
        
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(video, -this.canvas.width, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        const dataUrl = this.canvas.toDataURL('image/png');
        this.loadImage(dataUrl);
    }

    /**
     * Set the current filter
     * @param {string} filterCss - CSS filter string
     */
    setFilter(filterCss) {
        this.filter = filterCss;
        this.render();
    }

    /**
     * Add a sticker to the composition
     * @param {Object} sticker - { id, emoji, x, y, size } or { id, type: 'image', imageUrl, x, y, scale }
     */
    addSticker(sticker) {
        this.stickers.push({
            id: sticker.id || Date.now(),
            type: sticker.type || 'emoji',
            emoji: sticker.emoji,
            imageUrl: sticker.imageUrl,
            x: sticker.x ?? 0.5, 
            y: sticker.y ?? 0.5,
            size: sticker.size || 48,
            scale: sticker.scale || 1
        });
        return this.stickers[this.stickers.length - 1];
    }

    /**
     * Remove a sticker by ID
     * @param {number} id
     */
    removeSticker(id) {
        this.stickers = this.stickers.filter(s => s.id !== id);
    }

    /**
     * Update sticker position
     * @param {number} id
     * @param {number} x - Relative X (0-1)
     * @param {number} y - Relative Y (0-1)
     */
    updateStickerPosition(id, x, y) {
        const sticker = this.stickers.find(s => s.id === id);
        if (sticker) {
            sticker.x = x;
            sticker.y = y;
        }
    }

    /**
     * Render the full composition to canvas
     */
    render() {
        if (!this.baseImage) return;

        const { ctx, canvas, baseImage, filter, stickers } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.filter = filter === 'none' ? 'none' : filter;
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
    }

        /**
     * Bake stickers into the canvas
     * @param {Array} stickers - Array of { emoji, type, imageUrl, x, y, scale, rotation }
     */
    async bakeStickers(stickers) {
        this.render();
        
        if (!stickers || stickers.length === 0) return;

        const ctx = this.ctx;
        const canvas = this.canvas;

        for (const sticker of stickers) {
            ctx.save();
            
            ctx.filter = this.filter === 'none' ? 'none' : this.filter;
            
            const x = sticker.x * canvas.width;
            const y = sticker.y * canvas.height;
            const scale = sticker.scale || 1;
            
            ctx.translate(x, y);
            if (sticker.rotation) {
                ctx.rotate(sticker.rotation);
            }

            if (sticker.type === 'image' && sticker.imageUrl) {
                await new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                         const baseWidth = 128 * scale;
                         const aspectRatio = img.naturalHeight / img.naturalWidth;
                         const width = baseWidth;
                         const height = baseWidth * aspectRatio;
                         ctx.drawImage(img, -width/2, -height/2, width, height);
                         resolve();
                    };
                    img.onerror = resolve; 
                    img.src = sticker.imageUrl;
                });
            } else if (sticker.emoji) {
                const baseSize = 60;
                const fontSize = baseSize * scale;
                ctx.font = `${fontSize}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(sticker.emoji, 0, 0);
            }

            ctx.filter = 'none'; 
            ctx.restore();
        }
        
        this.stickers = stickers;
    }

    /**
     * Export the final composition as data URL
     * @param {string} type - MIME type
     * @param {number} quality - Quality (0-1)
     * @returns {string}
     */
    export(type = 'image/png', quality = 0.92) {
        return this.canvas.toDataURL(type, quality);
    }


    /**
     * Export as Blob for upload
     * @param {string} type
     * @param {number} quality
     * @returns {Promise<Blob>}
     */
    exportBlob(type = 'image/png', quality = 0.92) {
        return new Promise(resolve => {
            this.render();
            this.canvas.toBlob(resolve, type, quality);
        });
    }
}
