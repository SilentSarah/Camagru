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
 * File Created: Wednesday, 19th November 2025 3:35:50 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */


import Home from '../pages/Home.js';
import Login from '../pages/Login.js';
import Register from '../pages/Register.js';
import Error from '../pages/Error.js';
import Verify from '../pages/Verify.js';
import PasswordRecovery from '../pages/PasswordRecovery.js';
import ResetPassword from '../pages/ResetPassword.js';
import Profile from '../pages/Profile.js';
import Settings from '../pages/Settings.js';
import EditorPage from '../pages/EditorPage.js';
import PostPage from '../pages/PostPage.js';
import { useUser, user } from './Auth.js';
import Sidebar from '../components/Sidebar.js';
import MobileBottomBar from '../components/MobileBottomBar.js';
import routerHistory from './RouterHistory.js';
import { stopAllMediaStreams } from './Utils.js';

export const routes = [
    {
        path: '/signin',
        title: 'Sign In',
        protected: false,
        component: Login
    },
    {
        path: '/signup',
        title: 'Sign Up',
        protected: false,
        component: Register
    },
    {
        path: '/',
        title: 'Home',
        protected: true,
        component: Home
    },
    {
        path: '/verify',
        title: 'Verify Account',
        protected: false,
        component: Verify
    },
    {
        path: '/password-recovery',
        title: 'Recover Password',
        protected: false,
        component: PasswordRecovery
    },
    {
        path: '/reset-password',
        title: 'Reset Password',
        protected: false,
        component: ResetPassword
    },
    {
        path: '/profile',
        title: 'Profile',
        protected: true,
        component: Profile
    },
    {
        path: '/settings',
        title: 'Settings',
        protected: true,
        component: Settings
    },
    {
        path: '/editor',
        title: 'Photo Editor',
        protected: true,
        component: EditorPage
    },
    {
        path: '/post',
        title: 'View Post',
        protected: true,
        component: PostPage
    },
    {
        path: '/404',
        title: 'Not found',
        protected: false,
        component: Error
    },
]

/**
 * Used to determine whether the user is in the first page after load or not
 * @type {number}
 */
export let pageIdx = 0;

/**
 * @type {IntersectionObserver}
 */
let observer = null;

/**
 * @type {AbortController | null}
 */
export let abortController = null;

export function InjectAnchors(anchor) {
    const state = {
        index: routerHistory.get() + 1,
    }
    
    const isExternalLink = (a) => {
        const href = a.getAttribute('href') || '';
        return a.target === '_blank' || href.startsWith('http') || href.startsWith('//');
    };
    
    if (anchor) {
        if (isExternalLink(anchor)) return;
        anchor.onclick = async (event) => {
            event.preventDefault();
            history.pushState(state, '', anchor.getAttribute('href'));
            await Router();
        }
        return;
    }
    const anchors = document.querySelectorAll('a');
    anchors.forEach(anchor => {
        if (isExternalLink(anchor)) return;
        anchor.onclick = async (event) => {
            event.preventDefault();
            history.pushState(state, '', anchor.getAttribute('href'));
            await Router();
        }
    });
}

function destroyObserver() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
}

function initObserver() {
    observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0)) {
            InjectAnchors();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function destroyAbortController() {
    if (abortController) {
        abortController.abort("Route change");
        abortController = null;
    }
}

function createAbortController() {
    abortController = new AbortController();
}


async function Router() {
    const appRoot = document.body.querySelector('#app-root');
    let route = routes.find(r => r.path === window.location.pathname) ?? routes[routes.length - 1];

    stopAllMediaStreams();
    destroyAbortController();
    createAbortController();
    
    appRoot.innerHTML = '';

    destroyObserver();
    initObserver();
    if (await useUser(route)) {
        appRoot.appendChild(Sidebar());
        appRoot.appendChild(MobileBottomBar());
    } else if (route.protected) {
        route = routes.at(0);
    }
    
    appRoot.appendChild(await route.component());
    document.title = "Camagru | " + route.title;
    routerHistory.set(routerHistory.get() + 1);
}

export default Router