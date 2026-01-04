
import FetchCSRF from '../js/Csrf.js';
import { showToast } from '../components/Toast.js';
import { user } from '../js/Auth.js';
import { getCookie, goTo } from '../js/Utils.js';
import { abortController } from '../js/Router.js';

export default async function Settings() {
    const container = document.createElement('div');
    container.className = 'min-h-screen w-full bg-black text-white p-4 md:p-8 flex flex-col md:ml-16';

    // Main content wrapper
    const content = document.createElement('div');
    content.className = 'w-full max-w-2xl mx-auto';
    
    // Title
    const title = document.createElement('h1');
    title.className = 'text-xl font-semibold mb-8';
    title.textContent = 'Edit profile';
    content.appendChild(title);

    // Profile Photo Section
    const photoSection = document.createElement('div');
    photoSection.className = 'bg-[#262626] rounded-2xl p-5 mb-4 flex items-center justify-between';
    
    const photoLeft = document.createElement('div');
    photoLeft.className = 'flex items-center gap-4';
    
    const avatar = document.createElement('div');
    avatar.className = 'w-14 h-14 rounded-full overflow-hidden bg-gray-700';
    const avatarImg = document.createElement('img');
    avatarImg.src = user.profile_picture_url;
    avatarImg.className = 'w-full h-full object-cover';
    avatar.appendChild(avatarImg);
    
    const userInfo = document.createElement('div');
    const username = document.createElement('div');
    username.className = 'font-semibold text-white';
    username.textContent = user.username || 'Username';
    const fullname = document.createElement('div');
    fullname.className = 'text-sm text-gray-400';
    fullname.textContent = user.fullname || 'Full Name';
    userInfo.appendChild(username);
    userInfo.appendChild(fullname);
    
    photoLeft.appendChild(avatar);
    photoLeft.appendChild(userInfo);
    
    const changePhotoBtn = document.createElement('button');
    changePhotoBtn.type = 'button';
    changePhotoBtn.textContent = 'Change photo';
    changePhotoBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm';
    
    photoSection.appendChild(photoLeft);
    photoSection.appendChild(changePhotoBtn);
    content.appendChild(photoSection);

    // Form
    const form = document.createElement('form');
    form.className = 'flex flex-col gap-4';

    // Username
    const usernameGroup = createInputGroup('Username', 'text', 'username', user.username || '');
    form.appendChild(usernameGroup);

    // Email
    const emailGroup = createInputGroup('Email', 'email', 'email', user.email || '');
    form.appendChild(emailGroup);

    // Fullname
    const fullnameGroup = createInputGroup('Full Name', 'text', 'fullname', user.fullname || '');
    form.appendChild(fullnameGroup);

    // Bio
    const bioGroup = createTextareaGroup('Bio', 'bio', user.bio || '', 'Write a short bio...');
    form.appendChild(bioGroup);

    // Password
    const passwordGroup = createInputGroup('New Password', 'password', 'password', '', 'Leave blank to keep current');
    form.appendChild(passwordGroup);

    // Hidden file input for profile picture
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'hidden';
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Show loading state
        changePhotoBtn.disabled = true;
        changePhotoBtn.textContent = 'Uploading...';
        
        try {
            const formData = new FormData();
            formData.append('profile_picture', file);
            
            const csrfToken = await FetchCSRF();
            const token = getCookie('session_token');
            
            const response = await fetch(`${window.env.APP_URL}index.php/upload-profile-picture`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                signal: abortController.signal
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showToast('Profile picture updated!', 'success');
                avatarImg.src = result.profile_pic_url;
            } else {
                showToast(result.error || 'Upload failed', 'error');
            }
        } catch (error) {
            showToast('Upload failed', 'error');
        } finally {
            changePhotoBtn.disabled = false;
            changePhotoBtn.textContent = 'Change photo';
        }
    };
    form.appendChild(fileInput);

    changePhotoBtn.onclick = () => {
        fileInput.click();
    };

    // Save Button
    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.textContent = 'Save Changes';
    saveBtn.className = 'mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors opacity-50 cursor-not-allowed';
    saveBtn.disabled = true;
    form.appendChild(saveBtn);

    content.appendChild(form);

    // Divider
    const divider = document.createElement('hr');
    divider.className = 'my-8 border-gray-800';
    content.appendChild(divider);

    // Delete Account Section
    const deleteSection = document.createElement('div');
    deleteSection.className = 'text-center';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete Account';
    deleteBtn.className = 'text-red-500 hover:text-red-400 font-medium transition-colors text-sm';
    deleteBtn.onclick = () => showDeleteConfirmation();
    deleteSection.appendChild(deleteBtn);
    
    content.appendChild(deleteSection);
    container.appendChild(content);

    // Event Listeners
    form.onsubmit = async (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Remove empty password if not set
            if (!data.password) delete data.password;

            const csrfToken = await FetchCSRF();
            if (!csrfToken) throw new Error('CSRF Token failed');

            const token = getCookie('session_token');
            
            const response = await fetch(`${window.env.APP_URL}index.php/update-account`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRF-TOKEN': csrfToken,
                    'Authorization': `Bearer ${token}`
                },
                body: new URLSearchParams(data),
                signal: abortController.signal
            });

            const result = await response.json();

            if (response.ok) {
                showToast(result.message || 'Settings updated', 'success');
                goTo('/settings');
            } else {
                showToast(result.error || 'Update failed', 'error');
            }
        } catch (error) {
            showToast('An unexpected error occurred', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    };

    function showDeleteConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-[#262626] rounded-2xl p-6 max-w-sm w-full shadow-2xl';
        
        const h3 = document.createElement('h3');
        h3.className = 'text-xl font-bold text-white mb-2';
        h3.textContent = 'Delete Account?';
        
        const p = document.createElement('p');
        p.className = 'text-gray-400 mb-6 text-sm';
        p.textContent = 'This action cannot be undone. All your data will be permanently lost.';
        
        const actions = document.createElement('div');
        actions.className = 'flex gap-3 justify-end';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors';
        cancelBtn.onclick = () => modal.remove();
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Delete Forever';
        confirmBtn.className = 'px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors font-semibold';
        confirmBtn.onclick = async () => {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Deleting...';
            await performDelete();
        };
        
        actions.appendChild(cancelBtn);
        actions.appendChild(confirmBtn);
        
        modalContent.appendChild(h3);
        modalContent.appendChild(p);
        modalContent.appendChild(actions);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
    }

    async function performDelete() {
        try {
            const csrfToken = await FetchCSRF();
            const token = getCookie('session_token');

            const response = await fetch(`${window.env.APP_URL}index.php/delete-account`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Authorization': `Bearer ${token}`
                },
                signal: abortController.signal
            });

            const result = await response.json();

            if (response.ok) {
                showToast('Account deleted. Goodbye!', 'success');
                goTo('/signin');
            } else {
                showToast(result.error || 'Deletion failed', 'error');
                document.querySelector('.fixed.inset-0').remove();
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        }
    }

    function createInputGroup(label, type, name, value, placeholder = '') {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-2';
        
        const lbl = document.createElement('label');
        lbl.className = 'text-sm font-medium text-white';
        lbl.textContent = label;
        
        const input = document.createElement('input');
        input.type = type;
        input.name = name;
        input.value = value;
        if (placeholder) input.placeholder = placeholder;
        input.className = 'w-full bg-[#262626] border-none rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all';
        
        wrapper.appendChild(lbl);
        wrapper.appendChild(input);
        return wrapper;
    }

    function createTextareaGroup(label, name, value, placeholder = '') {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col gap-2';
        
        const lbl = document.createElement('label');
        lbl.className = 'text-sm font-medium text-white';
        lbl.textContent = label;
        
        const textarea = document.createElement('textarea');
        textarea.name = name;
        textarea.value = value;
        textarea.rows = 3;
        textarea.maxLength = 150;
        if (placeholder) textarea.placeholder = placeholder;
        textarea.className = 'w-full bg-[#262626] border-none rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all resize-none';
        
        const counter = document.createElement('div');
        counter.className = 'text-xs text-gray-500 text-right';
        counter.textContent = `${value.length} / 150`;
        
        textarea.oninput = () => {
            counter.textContent = `${textarea.value.length} / 150`;
        };
        
        wrapper.appendChild(lbl);
        wrapper.appendChild(textarea);
        wrapper.appendChild(counter);
        return wrapper;
    }

    const toggleSaveButton = (event) => {
        if (event.target.value !== user[event.target.name] || (event.target.name === 'password' && event.target.value !== '')) {
            saveBtn.disabled = false;
            saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            saveBtn.disabled = true;
            saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    content.querySelectorAll('input').forEach(input => {
        input.oninput = (e) => {
            toggleSaveButton(e);
        };
    });
    content.querySelector('textarea').oninput = (e) => {
        toggleSaveButton(e);
    };

    return container;
}
