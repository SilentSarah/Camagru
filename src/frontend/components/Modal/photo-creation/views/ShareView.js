/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 */

export function createShareView({ imageDataUrl }) {
    const container = document.createElement('div');
    container.className = 'flex flex-col lg:flex-row h-full';
    
    container.innerHTML = `
        <!-- Preview (Left) -->
        <div class="w-full lg:w-[65%] bg-black flex items-center justify-center">
            <img src="${imageDataUrl}" class="max-w-full max-h-full object-contain">
        </div>

        <!-- Details (Right) -->
        <div class="w-full lg:w-[35%] bg-insta border-l border-neutral-800 p-4 flex flex-col gap-4">
            <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-700"></div> 
                    <span class="font-semibold text-sm">You</span>
            </div>

            <textarea id="caption-input" class="w-full h-40 bg-transparent text-white resize-none outline-none text-sm placeholder-gray-500" placeholder="Write a caption..."></textarea>
            
            <div class="border-t border-gray-800 pt-4 cursor-pointer flex justify-between group">
                <span class="text-sm">Add Location</span>
                <i class="fa-solid fa-location-dot text-gray-400 group-hover:text-white"></i>
            </div>
        </div>
    `;

    // Getter for the caption
    container.getCaption = () => container.querySelector('#caption-input').value;

    return container;
}
