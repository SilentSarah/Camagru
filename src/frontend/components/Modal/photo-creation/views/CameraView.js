/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 */

import { showToast } from '../../../Toast.js';

export function createCameraView({ onCapture, onError }) {
    const container = document.createElement('div');
    container.className = 'relative w-full h-full bg-black flex items-center justify-center';
    
    container.innerHTML = `
        <video id="camera-video" class="w-full h-full object-cover transform scale-x-[-1]" autoplay playsinline muted></video>
        <canvas id="camera-canvas" class="hidden"></canvas>
        <button id="capture-btn" class="absolute bottom-8 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform bg-white/20 backdrop-blur-sm">
            <div class="w-12 h-12 bg-white rounded-full"></div>
        </button>
    `;

    const video = container.querySelector('#camera-video');
    let mediaStream = null;

    // Start Camera
    const startCamera = async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            video.srcObject = mediaStream;
        } catch (e) {
            console.error(e);
            if (onError) onError(e);
            else showToast('Camera access failed', 'error');
        }
    };
    
    // Stop Camera helper attached to the element
    container.stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    };

    container.querySelector('#capture-btn').onclick = () => {
         const canvas = container.querySelector('#camera-canvas');
         canvas.width = video.videoWidth;
         canvas.height = video.videoHeight;
         const ctx = canvas.getContext('2d');
         ctx.translate(canvas.width, 0);
         ctx.scale(-1, 1);
         ctx.drawImage(video, 0, 0);
         
         const dataUrl = canvas.toDataURL('image/png');
         container.stopCamera();
         onCapture(dataUrl);
    };

    // Auto-start
    startCamera();

    return container;
}
