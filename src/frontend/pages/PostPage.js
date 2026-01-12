/*
 * File Created: Wednesday, 1st January 2026
 * Post View Page - Displays a single post with comments
 */

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
} from '../components/post-modal/index.js';
import { user as currentUser } from '../js/Auth.js';
import { showToast } from '../components/Toast.js';
import FetchCSRF from '../js/Csrf.js';
import { getCookie, goTo } from '../js/Utils.js';
import { openConfirmationModal } from '../components/Modal/ConfirmationModal.js';
import { abortController } from '../js/Router.js';
import apiFetch from '../js/ApiClient.js';
import routerHistory from '../js/RouterHistory.js';

export default async function PostPage() {
    const container = document.createElement('div');
    container.className = 'min-h-screen w-full bg-black text-white flex items-center justify-center p-4 md:p-8 md:ml-16 pb-20 md:pb-0';

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        container.innerHTML = `
            <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">Post not found</h1>
                <p class="text-gray-400 mb-6">The post you're looking for doesn't exist or has been removed.</p>
                <button id="go-back" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Go Back
                </button>
            </div>
        `;
        container.querySelector('#go-back').onclick = () => history.back();
        return container;
    }

    container.innerHTML = `
        <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    `;

    try {
        const session_token = getCookie('session_token');
        const response = await apiFetch(`${window.env.APP_URL}/photo?id=${postId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${session_token}`
            },
            signal: abortController.signal
        });

        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }

        const data = await response.json();
        const photo = data.data || data;
        
        if (!photo || !photo.id) {
            throw new Error('Post not found');
        }

        const imageUrl = `${window.env.UPLOADS_URL}/${photo.file_name}`;

        const user = photo.user || {
            id: photo.user_id,
            username: 'Unknown',
            profile_picture_url: null
        };

        const likes = photo.likes || 0;
        const comments = photo.comments || [];

        const shareLinks = generateShareLinks({
            postId: photo.id,
            userId: photo.user_id,
            description: photo.description,
            imagePath: imageUrl
        });

        container.innerHTML = '';
        container.className = 'min-h-screen w-full bg-black text-white flex flex-col lg:flex-row items-center justify-center p-0 md:ml-16 pb-16 md:pb-0';

        const postContainer = document.createElement('div');
        postContainer.className = 'w-full max-w-6xl bg-neutral-900 flex flex-col lg:flex-row lg:h-[85vh] overflow-hidden rounded-none lg:rounded-xl';

        const imgSection = document.createElement('div');
        imgSection.className = 'w-full lg:w-[60%] h-[40vh] lg:h-full bg-black flex items-center justify-center relative overflow-hidden';
        imgSection.innerHTML = PostImage({ imagePath: imageUrl, username: user?.username });

        const backBtn = document.createElement('button');
        backBtn.className = 'absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10';
        backBtn.innerHTML = '<i class="fa-solid fa-arrow-left text-white"></i>';
        backBtn.onclick = () => {
            routerHistory.set(routerHistory.get() - 1);
            if (routerHistory.get() > 0) {
                history.back();
            } else {
                goTo('/');
            }
        };
        imgSection.appendChild(backBtn);

        const isAuthor = currentUser?.id === photo.user_id;
        
        const detailsSection = document.createElement('div');
        detailsSection.className = 'w-full lg:min-w-[360px] lg:w-[40%] flex flex-col h-[60vh] lg:h-full border-t lg:border-t-0 lg:border-l border-gray-800';

        detailsSection.innerHTML = `
            <div class="p-4 border-b border-gray-800">
                ${PostAuthorHeader({ user, createdAt: photo.created_at, isAuthor })}
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 custom-scrollbar" id="comments-container">
                ${PostDescription({ user, description: photo.description, createdAt: photo.created_at })}
                <div class="mt-4 border-t border-gray-800/50 pt-4">
                    ${CommentsList({ 
                        comments, 
                        isPostAuthor: isAuthor, 
                        currentUserId: currentUser?.id,
                        onDelete: (id) => deleteComment(id)
                    })}
                </div>
            </div>

            <div class="p-4 border-t border-gray-800 bg-neutral-900 z-10">
                <div class="relative">
                    ${ActionBar({ likes, isLiked: photo.is_liked_by_user })}
                    ${ShareDropdown({ shareLinks, hidden: true })}
                </div>
                <div class="mt-2">
                    ${CommentInput({ placeholder: 'Add a comment...' })}
                </div>
            </div>
        `;

        postContainer.appendChild(imgSection);
        postContainer.appendChild(detailsSection);
        container.appendChild(postContainer);

        const styleDiv = document.createElement('div');
        styleDiv.innerHTML = ModalStyles();
        container.appendChild(styleDiv);

        const headBackToProfile = (e) => {
            if (e.target !== container) return;

            urlParams.forEach((value, key) => {
                urlParams.delete(key);
            });
            if (photo.user_id !== currentUser?.id) {
                urlParams.set('user_id', photo.user_id);
            }
            goTo('/profile' + (urlParams.toString() ? '?' + urlParams.toString() : ''));
        }
        container.addEventListener('click', headBackToProfile);

        let isLiked = photo.is_liked_by_user;
        let currentLikes = likes;

        const likeBtn = container.querySelector('#like-btn');
        const likesCountSpan = container.querySelector('#likes-count');

        if (likeBtn) {
            likeBtn.onclick = async () => {
                likeBtn.disabled = true;
                likeBtn.classList.add('animate-pulse', 'scale-110', 'transition-transform', 'duration-200');
                isLiked = !isLiked;
                currentLikes = isLiked ? currentLikes + 1 : currentLikes - 1;

                likeBtn.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-2xl"></i>`;
                likeBtn.classList.toggle('text-red-500', isLiked);
                likeBtn.classList.toggle('text-white', !isLiked);

                if (likesCountSpan) {
                    likesCountSpan.textContent = currentLikes.toLocaleString();
                }

                try {
                    const response = await apiFetch(`${window.env.APP_URL}/toggle-like`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getCookie("session_token")}`,
                            'X-CSRF-TOKEN': await FetchCSRF()
                        },
                        body: JSON.stringify({ photo_id: photo.id }),
                        signal: abortController.signal
                    });

                    if (!response.ok) throw new Error('Failed to toggle like');
                } catch (error) {
                    isLiked = !isLiked;
                    currentLikes = isLiked ? currentLikes + 1 : currentLikes - 1;
                    likeBtn.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-2xl"></i>`;
                    likeBtn.classList.toggle('text-red-500', isLiked);
                    likeBtn.classList.toggle('text-white', !isLiked);
                    if (likesCountSpan) likesCountSpan.textContent = currentLikes.toLocaleString();
                    showToast('Failed to update like', 'error');
                } finally {
                    likeBtn.disabled = false;
                    likeBtn.classList.remove('animate-pulse', 'scale-110', 'transition-transform', 'duration-200');
                }
            };
        }

        const emojiBtn = container.querySelector('#emoji-btn');
        const emojiPopover = container.querySelector('#emoji-popover');
        const commentInput = container.querySelector('#comment-input');
        const postCommentBtn = container.querySelector('#post-comment-btn');

        if (emojiBtn && emojiPopover) {
            const emojis = ['😀', '😂', '😍', '🔥', '👍', '👎', '❤️', '💔', '😮', '😢', '😡', '🎉', '👏', '🙌', '🤔', '😎', '🤩', '🥳'];
            const emojiGrid = emojiPopover.querySelector('.grid');

            if (emojiGrid) {
                emojiGrid.innerHTML = emojis.map(emoji => `
                    <button class="emoji-item text-2xl hover:bg-gray-700 rounded p-1 transition-colors">${emoji}</button>
                `).join('');

                emojiGrid.querySelectorAll('.emoji-item').forEach(btn => {
                    btn.onclick = () => {
                        commentInput.value += btn.textContent;
                        commentInput.focus();
                        if (postCommentBtn) {
                            postCommentBtn.disabled = false;
                            postCommentBtn.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
                        }
                    };
                });
            }

            emojiBtn.onclick = (e) => {
                e.stopPropagation();
                emojiPopover.classList.toggle('hidden');
            };

            document.addEventListener('click', (e) => {
                if (!emojiBtn.contains(e.target) && !emojiPopover.contains(e.target)) {
                    emojiPopover.classList.add('hidden');
                }
            });
        }

        if (commentInput && postCommentBtn) {
            commentInput.oninput = () => {
                const isEmpty = commentInput.value.trim().length === 0;
                postCommentBtn.disabled = isEmpty;
                if (isEmpty) {
                    postCommentBtn.classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');
                } else {
                    postCommentBtn.classList.remove('disabled:opacity-50', 'disabled:cursor-not-allowed');
                }
            };
        }

        const commentsListEl = container.querySelector('#comments-list');

        const submitComment = async () => {
            const text = commentInput.value.trim();
            if (!text) return;

            postCommentBtn.disabled = true;
            const originalWidth = postCommentBtn.offsetWidth;
            postCommentBtn.style.minWidth = `${originalWidth}px`;
            postCommentBtn.textContent = 'Posting...';

            try {
                const response = await apiFetch(`${window.env.APP_URL}/create-comment`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getCookie("session_token")}`,
                        'X-CSRF-TOKEN': await FetchCSRF()
                    },
                    body: JSON.stringify({
                        photo_id: photo.id,
                        content: text
                    }),
                    signal: abortController.signal
                });

                if (!response.ok) throw new Error('Failed to post comment');

                const responseData = await response.json();

                const newComment = {
                    id: responseData.data?.id,
                    user: currentUser || { username: 'You', profile_picture_url: null },
                    content: text,
                    text: text,
                    created_at: new Date().toISOString(),
                    timestamp: new Date().toISOString(),
                    likes: 0
                };

                const commentHTML = Comment({
                    ...newComment,
                    showReplyButton: false,
                    canDelete: true
                });

                const emptyState = container.querySelector('.comments-empty-state');
                if (emptyState) emptyState.remove();

                if (commentsListEl) {
                    commentsListEl.insertAdjacentHTML('beforeend', commentHTML);
                    const scrollContainer = container.querySelector('#comments-container');
                    if (scrollContainer) {
                        scrollContainer.scrollTo({
                            top: scrollContainer.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                }

                commentInput.value = '';
            } catch (error) {
                showToast('Failed to post comment', 'error');
            } finally {
                postCommentBtn.disabled = false;
                postCommentBtn.textContent = 'Post';
                postCommentBtn.style.minWidth = '';
                postCommentBtn.classList.add('disabled:opacity-50', 'disabled:cursor-not-allowed');
                postCommentBtn.disabled = true;
            }
        };

        if (postCommentBtn) postCommentBtn.onclick = submitComment;
        if (commentInput) {
            commentInput.onkeypress = (e) => {
                if (e.key === 'Enter') submitComment();
            };
        }

        const deleteComment = (commentId) => {
            openConfirmationModal({
                message: 'Are you sure you want to delete this comment?',
                confirmText: 'Delete',
                onConfirm: async () => {
                    try {
                        const response = await apiFetch(`${window.env.APP_URL}/delete-comment?id=${commentId}`, {
                            method: 'DELETE',
                            credentials: 'include',
                            headers: {
                                'Authorization': `Bearer ${getCookie("session_token")}`,
                                'X-CSRF-TOKEN': await FetchCSRF()
                            },
                            signal: abortController.signal
                        });

                        if (!response.ok) throw new Error('Failed to delete comment');

                        const commentEl = container.querySelector(`[data-comment-id="${commentId}"]`);
                        if (commentEl) commentEl.remove();

                        showToast('Comment deleted', 'success');
                    } catch (error) {
                        showToast('Failed to delete comment', 'error');
                    }
                }
            });
        };

        const shareBtn = container.querySelector('#share-btn');
        const shareDropdown = container.querySelector('#share-dropdown');
        const copyLinkBtn = container.querySelector('#copy-link-btn');

        if (shareBtn && shareDropdown) {
            shareBtn.onclick = (e) => {
                e.stopPropagation();
                shareDropdown.classList.toggle('hidden');
            };

            document.addEventListener('click', (e) => {
                if (!shareBtn.contains(e.target) && !shareDropdown.contains(e.target)) {
                    shareDropdown.classList.add('hidden');
                }
            });
        }

        if (copyLinkBtn) {
            copyLinkBtn.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(shareLinks.postUrl);
                    showToast('Link copied to clipboard!', 'success');
                    shareDropdown.classList.add('hidden');
                } catch (error) {
                    showToast('Failed to copy link', 'error');
                }
            };
        }

        if (isAuthor) {
            const optionsBtn = container.querySelector('#post-options-btn');
            const optionsDropdown = container.querySelector('#post-options-dropdown');
            const deleteBtn = container.querySelector('#delete-post-btn');

            if (optionsBtn && optionsDropdown) {
                optionsBtn.onclick = (e) => {
                    e.stopPropagation();
                    optionsDropdown.classList.toggle('hidden');
                };

                document.addEventListener('click', (e) => {
                    if (!optionsBtn.contains(e.target) && !optionsDropdown.contains(e.target)) {
                        optionsDropdown.classList.add('hidden');
                    }
                });
            }

            if (deleteBtn) {
                deleteBtn.onclick = () => {
                    openConfirmationModal({
                        message: 'Are you sure you want to delete this post? This action cannot be undone.',
                        confirmText: 'Delete',
                        onConfirm: async () => {
                            try {
                                const response = await apiFetch(`${window.env.APP_URL}/delete-post?id=${photo.id}`, {
                                    method: 'DELETE',
                                    credentials: 'include',
                                    headers: {
                                        'Authorization': `Bearer ${getCookie("session_token")}`,
                                        'X-CSRF-TOKEN': await FetchCSRF()
                                    },
                                    signal: abortController.signal
                                });

                                if (response.ok) {
                                    goTo('/profile');
                                } else {
                                    const errorData = await response.json();
                                    showToast(errorData.error || 'Failed to delete post', 'error');
                                }
                            } catch (error) {
                                showToast('An error occurred while deleting the post', 'error');
                            }
                        }
                    });
                };
            }
        }

        if (commentsListEl) {
            commentsListEl.addEventListener('click', (e) => {
                const deleteBtnEl = e.target.closest('.comment-delete-btn');
                if (deleteBtnEl) {
                    const commentId = deleteBtnEl.getAttribute('data-delete-comment-id');
                    if (commentId) {
                        deleteComment(commentId);
                    }
                }
            });
        }

    } catch (error) {
        showToast('Error loading post', 'error');
        container.innerHTML = `
            <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">Post not found</h1>
                <p class="text-gray-400 mb-6">The post you're looking for doesn't exist or has been removed.</p>
                <button id="go-back" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Go Back
                </button>
            </div>
        `;
        container.querySelector('#go-back').onclick = () => history.back();
    }
    return container;
}
