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
import { useUser, user } from './Auth.js';
import { goTo, injectTooltips } from './Utils.js';
import Sidebar from '../components/Sidebar.js';

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
        path: '/404',
        title: 'Not found',
        protected: false,
        component: Error
    },
]

let observer = null;
export function InjectAnchors(anchor) {
    if (anchor) {
        anchor.onclick = (event) => {
            event.preventDefault();
            history.pushState(null, '', anchor.getAttribute('href'));
            Router();
        }
        return ;
    }
    const anchors = document.querySelectorAll('a');
    anchors.forEach(anchor => {
        anchor.onclick = (event) => {
            event.preventDefault();
            history.pushState(null, '', anchor.getAttribute('href'));
            Router();
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


async function Router() {
    const parentComp = document.body;
    const route = routes.find(r => r.path === window.location.pathname) ?? routes[routes.length - 1];

    parentComp.innerHTML = '';

    destroyObserver();
    initObserver();
    if (await useUser(route)) parentComp.appendChild(Sidebar());

    parentComp.appendChild(await route.component());
    document.title = "Camagru | " + route.title;
}   

export default Router