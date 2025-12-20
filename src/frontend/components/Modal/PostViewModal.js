/*
 * File Created: Tuesday, 16th December 2025
 * Author: Camagru Team
 */

import Modal from './Modal.js';
import {
    PostAuthorHeader,
    PostDescription,
    CommentsList,
    ActionBar,
    ShareDropdown,
    generateShareLinks,
    CommentInput,
    PostImage,
    ModalStyles, 
    Comment
} from '../post-modal/index.js';

/**
 * Post View Modal - Displays a single post with comments
 * @param {Object} props
 * @param {Object} props.photo - Photo data
 * @param {Object} props.user - User data
 * @param {Function} props.onClose
 */
export default function PostViewModal({ photo, user, likes = 0, comments = [], onClose, onLike, onComment }) {
    // Generate share links
    const shareLinks = generateShareLinks({
        postId: photo.id,
        description: photo.description,
        imagePath: photo.image_path
    });

    // Content Container (Grid Layout)
    const content = document.createElement('div');
    content.className = 'flex flex-col lg:flex-row w-full max-w-6xl h-[85vh] overflow-hidden bg-insta';

    // LEFT: Image
    const imgSection = document.createElement('div');
    imgSection.className = 'w-full lg:w-[60%] h-[40vh] lg:h-full bg-black flex items-center justify-center relative';
    imgSection.innerHTML = PostImage({ imagePath: photo.image_path, username: user?.username });
    
    // RIGHT: Details
    const detailsSection = document.createElement('div');
    detailsSection.className = 'w-full lg:w-[40%] flex flex-col h-full border-l border-gray-800';

    // Header
    detailsSection.innerHTML = `
        <div class="p-4 border-b border-gray-800">
            ${PostAuthorHeader({ user, createdAt: photo.created_at })}
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar" id="comments-container">
            ${PostDescription({ user, description: photo.description, createdAt: photo.created_at })}
            <div class="mt-4 border-t border-gray-800/50 pt-4">
                ${CommentsList({ comments })}
            </div>
        </div>

        <div class="p-4 border-t border-gray-800 bg-insta z-10">
            ${ActionBar({ likes, isLiked: likes > 0 })}
            ${ShareDropdown({ shareLinks, hidden: true })}
            <div class="mt-2">
                ${CommentInput({ placeholder: 'Add a comment...' })}
            </div>
        </div>
    `;

    // Append sections
    content.appendChild(imgSection);
    content.appendChild(detailsSection);

    // Create Modal
    const modal = Modal({
        isOpen: true,
        onClose: onClose,
        children: content,
        className: 'overflow-hidden p-0' // Specific override for split view
    });

    // --- Logic Implementation (Re-using logic from old PostModal) ---
    // (We need to re-attach event listeners because the sub-components return HTML strings, not Elements)
    
    let isLiked = likes > 0;
    
    // Like Handler
    const likeBtn = modal.querySelector('#like-btn');
    if (likeBtn) {
        likeBtn.onclick = () => {
            isLiked = !isLiked;
            // Update UI
            likeBtn.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-2xl"></i>`;
            likeBtn.classList.toggle('text-red-500', isLiked);
            likeBtn.classList.toggle('text-white', !isLiked);
            
            // Note: Ideally we would update the count too, but it's embedded in ActionBar HTML string
            // For MVP we just toggle the icon
            if (onLike) onLike(isLiked);
        };
    }

    // Comment Handler
    const commentInput = modal.querySelector('#comment-input');
    const postCommentBtn = modal.querySelector('#post-comment-btn');
    const commentsContainer = modal.querySelector('#comments-list'); // Inner list

    const submitComment = () => {
        const text = commentInput.value.trim();
        if (!text) return;

        const newComment = {
            id: Date.now(),
            user: window.currentUser || { username: 'You', avatar_url: null }, // Fallback
            text: text,
            timestamp: 'Just now',
            likes: 0
        };

        // Render new comment
        const commentHTML = Comment({
            ...newComment,
            showReplyButton: false
        });
        
        // Remove empty state if exists
        const emptyState = modal.querySelector('.comments-empty-state');
        if (emptyState) emptyState.remove();

        // Append
        if (commentsContainer) {
            commentsContainer.insertAdjacentHTML('beforeend', commentHTML);
            commentsContainer.scrollTop = commentsContainer.scrollHeight;
        }

        commentInput.value = '';
        if (onComment) onComment(newComment);
    };

    if (postCommentBtn) postCommentBtn.onclick = submitComment;
    if (commentInput) {
        commentInput.onkeypress = (e) => {
            if (e.key === 'Enter') submitComment();
        };
    }

    // Share Toggle
    const shareBtn = modal.querySelector('#share-btn');
    const shareDropdown = modal.querySelector('#share-dropdown');
    if (shareBtn && shareDropdown) {
        shareBtn.onclick = () => shareDropdown.classList.toggle('hidden');
    }

    // Inject Styles if needed (ModalStyles returns a style tag string)
    const styleDiv = document.createElement('div');
    styleDiv.innerHTML = ModalStyles();
    modal.appendChild(styleDiv);

    return modal;
}

/**
 * Helper to open the modal
 */
export function openPostModal(options) {
    const modal = PostViewModal(options);
    document.body.appendChild(modal);
    return modal;
}
