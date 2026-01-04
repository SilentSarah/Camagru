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
 * File Created: Thursday, 12th December 2025
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import Comment from './Comment.js';

/**
 * CommentsEmptyState - Displays when there are no comments
 * @returns {string} HTML string
 */
export function CommentsEmptyState() {
    return /*html*/`
        <div class="flex flex-col items-center justify-center py-8 text-center comments-empty-state">
            <i class="fa-regular fa-comment text-4xl text-gray-600 mb-3"></i>
            <p class="text-gray-300 font-semibold">No comments yet</p>
            <p class="text-gray-400 text-sm mt-1">Start the conversation!</p>
        </div>
    `;
}

/**
 * CommentsList - Displays a list of comments or empty state
 * @param {Object} props - Component props
 * @param {Array} props.comments - Array of comment objects {id, user, text, timestamp, likes}
 * @returns {string} HTML string
 */
export default function CommentsList({ comments = [], isPostAuthor = false, currentUserId = null, onDelete }) {

    const commentsHTML = comments.map(comment => {
        const isCommentAuthor = currentUserId && comment.user?.id === currentUserId;
        const canDelete = isPostAuthor || isCommentAuthor;
        
        return Comment({
            id: comment.id,
            user: comment.user,
            text: comment.content,
            timestamp: comment.created_at,
            showReplyButton: false,
            canDelete,
            onDelete
        });
    }).join('');

    return /*html*/`
        <div id="comments-list" class="space-y-4">
            ${commentsHTML}
        </div>
    `;
}
