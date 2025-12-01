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
import About from '../pages/About.js';
import Sidebar from '../components/Sidebar.js';
import Error from '../pages/Error.js';

export const routes = [
    {
        path: '/signin',
        title: 'Sign In',
        component: Login
    },
    {
        path: '/',
        title: 'Home',
        component: Home
    },
    {
        path: '/signup',
        title: 'Sign Up',
        component: Register
    },
    {
        path: '/about',
        title: 'About',
        component: About
    },
    {
        path: '/404',
        title: 'Not found',
        component: Error
    }
]

export const AuthPages = ["/signin", "/signup"];

function InjectAnchors() {
    const anchors = document.querySelectorAll('a');
    anchors.forEach(anchor => {
        anchor.onclick = (event) => {
            event.preventDefault();
            history.pushState(null, '', anchor.getAttribute('href'));
            Router();
        }
    });
}

async function Router() {
    const parentComp = document.body;
    const route = routes.find(r => r.path === window.location.pathname) ?? routes[routes.length - 1];

    parentComp.innerHTML = '';
    parentComp.appendChild(await route.component());
    InjectAnchors();
    document.title = "Camagru | " + route.title;
}

export default Router