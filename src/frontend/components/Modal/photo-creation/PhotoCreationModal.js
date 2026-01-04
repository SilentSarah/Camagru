/*
 * File Created: Sunday, 21st December 2025
 * Author: Camagru Team
 */

import Modal from '../Modal.js';
import { injectStyles, removeStyles } from './styles.js';
import { DraftStorage } from '../../../utils/DraftStorage.js';
import { showToast } from '../../Toast.js';
import { createSelectionView } from './views/SelectionView.js';
import { createRecentsView } from './views/RecentsView.js';
import { createLiveEditorView } from './views/LiveEditorView.js';
import { createShareView } from './views/ShareView.js';
import { getCookie } from '../../../js/Utils.js'
import FetchCSRF from '../../../js/Csrf.js';
import { PhotoCompositor } from '../../../utils/PhotoCompositor.js';
import { abortController } from '../../../js/Router.js';

// In-memory recents array
const recents = [];

export default function PhotoCreationModal({ onClose, onPost }) {
    let mode = 'selection';
    let editorState = {
        filter: 'none',
        stickers: [],
        hasModification: false
    };

    // Track last state for back navigation
    let lastEditState = {
        mode: 'camera',
        imageUrl: null,
        filter: 'none',
        stickers: []
    };

    // --- Container Setup ---
    injectStyles();

    const contentContainer = document.createElement('div');
    contentContainer.className = 'bg-insta rounded-xl flex flex-col overflow-hidden text-neutral-100 shadow-2xl transition-all duration-300';
    contentContainer.style.width = 'min(90vw, 500px)';
    contentContainer.style.height = 'min(80vh, 550px)';
    
    // Header
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between h-[44px] px-4 border-b border-neutral-800 shrink-0';
    header.innerHTML = `
        <button id="modal-back-btn" class="text-neutral-100 hover:opacity-70 transition-opacity hidden">
            <i class="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <button id="modal-cancel-btn" class="text-neutral-100 text-2xl hover:opacity-70 transition-opacity leading-none">
            &times;
        </button>
        <h2 id="modal-title" class="font-semibold text-base flex-1 text-center">Create new post</h2>
        <div id="header-right-placeholder" class="w-6"></div>
    `;
    contentContainer.appendChild(header);

    const main = document.createElement('div');
    main.className = 'flex-1 relative overflow-hidden bg-neutral-900 flex flex-col';
    contentContainer.appendChild(main);

    // --- Modal Wrapper ---
    const modal = Modal({
        isOpen: true,
        onClose: () => {
             // Cleanup
             if (main.stopCamera) main.stopCamera();
             removeStyles();
             if (onClose) onClose();
        },
        children: contentContainer,
        className: 'p-0 bg-transparent shadow-none border-0',
        hideCloseButton: true
    });
    
    modal.close = () => {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.click(); 
    };

    // --- Header Logic ---
    const updateHeader = (title, showBack) => {
        header.querySelector('#modal-title').textContent = title;
        const backBtn = header.querySelector('#modal-back-btn');
        const cancelBtn = header.querySelector('#modal-cancel-btn');
        
        // Clear right placeholder (removes Share button etc from previous views)
        const rightPlaceholder = header.querySelector('#header-right-placeholder');
        rightPlaceholder.innerHTML = ''; 

        if (showBack) {
            backBtn.classList.remove('hidden');
            cancelBtn.classList.add('hidden');
        } else {
            backBtn.classList.add('hidden');
            cancelBtn.classList.remove('hidden');
        }
    };

    header.querySelector('#modal-cancel-btn').onclick = () => {
        if (mode === 'editor' || mode === 'share') {
            if (confirm('Discard changes?')) modal.close();
        } else {
            modal.close();
        }
    };

    header.querySelector('#modal-back-btn').onclick = () => {
        if (mode === 'editor' || mode === 'recents') {
            renderSelection();
        } else if (mode === 'share') {
            renderLiveEditor(lastEditState.mode, lastEditState.imageUrl, lastEditState.filter, lastEditState.stickers);
        }
    };

    // --- Views renderers ---

    const setMainContent = (view) => {
        // Cleanup previous camera if exists
        if (main.stopCamera) {
            main.stopCamera();
            main.stopCamera = null;
        }
        main.innerHTML = '';
        main.appendChild(view);
    };

    const setDimensions = (w, h) => {
        contentContainer.style.width = w;
        contentContainer.style.height = h;
    };

    const renderSelection = () => {
        mode = 'selection';
        updateHeader('Create new post', false);
        setDimensions('min(90vw, 500px)', 'min(80vh, 550px)');

        const view = createSelectionView({
            recents,
            onUpload: (file) => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    let url = e.target.result;
                    // Only resize if NOT a GIF to preserve animation
                    if (file.type !== 'image/gif') {
                        url = await PhotoCompositor.resizeImage(url);
                    }
                    renderLiveEditor('image', url);
                };
                reader.readAsDataURL(file);
            },
            onCamera: () => renderLiveEditor('camera'),
            onRecents: () => renderRecents(),
        });

        // Handler for clicking a recent item from selection screen
        view.setOnSelectRecent(async (recent) => {
            let url = recent.imageUrl;
            if (!url.startsWith('data:image/gif')) {
                url = await PhotoCompositor.resizeImage(url);
            }
            renderLiveEditor('image', url, recent.filter, recent.stickers);
        });

        setMainContent(view);
    };

    const renderRecents = () => {
        mode = 'recents';
        updateHeader('Recent Edits', true);
        
        const view = createRecentsView({
            recents,
            onSelect: async (recent) => {
                let url = recent.imageUrl;
                if (!url.startsWith('data:image/gif')) {
                    url = await PhotoCompositor.resizeImage(url);
                }
                renderLiveEditor('image', url, recent.filter || 'none', recent.stickers || [], recent.id);
            },
            onClearAll: () => {
                recents.length = 0;
                DraftStorage.clearDrafts();
                renderRecents();
            },
            onDelete: (index, id) => {
                if (index < recents.length) {
                    recents.splice(index, 1);
                } else if (id) {
                    DraftStorage.deleteDraft(parseInt(id));
                }
                renderRecents();
            }
        });

        setMainContent(view);
    };

    const renderLiveEditor = (editorMode = 'camera', imageUrl = null, initialFilter = 'none', initialStickers = [], fromDraftId = null) => {
        mode = 'editor';
        updateHeader(editorMode === 'camera' ? 'Take Photo' : 'Edit Photo', true);
        setDimensions('min(95vw, 900px)', 'min(90vh, 700px)');

        const view = createLiveEditorView({
            mode: editorMode,
            imageUrl,
            initialFilter,
            initialStickers,
            onCapture: async (dataUrl, state) => {
                // Save state for back navigation
                lastEditState = {
                    mode: editorMode,
                    imageUrl: editorMode === 'image' ? imageUrl : dataUrl,
                    filter: state.filter,
                    stickers: state.stickers
                };
                
                editorState = state;

                // Save as draft
                DraftStorage.saveDraft({
                    thumbnail: dataUrl,
                    imageUrl: editorMode === 'image' ? imageUrl : dataUrl,
                    filter: state.filter,
                    stickers: state.stickers.map(s => ({...s, element: undefined}))
                });

                // If editing from a draft, delete the old one
                if (fromDraftId) {
                    DraftStorage.deleteDraft(fromDraftId);
                }

                renderShare(dataUrl);
            },
            onStateChange: (state) => {
                editorState = state;
            },
            onError: (e) => {
                showToast('Camera access failed', 'error');
                renderSelection();
            }
        });
        
        // Expose stopCamera for cleanup
        main.stopCamera = view.stopCamera;
        
        setMainContent(view);
    };

    const renderShare = (finalImageUrl) => {
        mode = 'share';
        updateHeader('Create new post', true);
        setDimensions('min(95vw, 900px)', 'min(90vh, 700px)');

        const view = createShareView({ imageDataUrl: finalImageUrl });

        // Add Share button to header
        const rightPlaceholder = header.querySelector('#header-right-placeholder');
        rightPlaceholder.innerHTML = `
            <button id="share-btn" class="text-blue-500 font-semibold text-sm hover:text-white transition-colors">Share</button>
        `;

        header.querySelector('#share-btn').onclick = async () => {
            const caption = view.getCaption();
            const btn = header.querySelector('#share-btn');
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            try {
                const blob = await fetch(finalImageUrl).then(r => r.blob());
                const formData = new FormData();
                const extension = finalImageUrl.split(";").shift().split("/").pop();
                formData.append('image', blob, `post-${Date.now()}.${extension}`);
                formData.append('description', caption);

                const jwtToken = getCookie('session_token');
                const csrfToken = await FetchCSRF();

                const response = await fetch(`${window.env.APP_URL}upload-post`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'X-CSRF-TOKEN': csrfToken
                    },
                    signal: abortController.signal
                });

                if (!response.ok) throw new Error('Upload failed');
                if (onPost) onPost({ imageUrl: finalImageUrl, description: caption }); 
                
                showToast('Post shared!', 'success');
                modal.close();
            } catch (e) {
                 showToast('Upload failed', 'error');
                 btn.textContent = 'Share';
                 btn.disabled = false;
            }
        };

        setMainContent(view);
    };

    // Initialize
    renderSelection();

    return modal;
}

export function openPhotoCreationModal(options) {
    const modal = PhotoCreationModal(options);
    document.body.appendChild(modal);
    return modal;
}

