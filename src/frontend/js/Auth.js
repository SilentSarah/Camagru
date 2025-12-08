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
 * File Created: Monday, 1st December 2025 8:15:19 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { getCookie } from "./Utils.js";
import { goTo } from "./Utils.js";
import { showToast } from "../components/Toast.js";
import User from "./User.js";

/**
 * @type {User | null}
 */
export let user = null;


/**
 * User Hook, fetches user data from the server
 * @param {{protected: boolean}} route 
 */
export async function useUser(route) {
    const session_token = getCookie("session_token");
    if (!session_token) {
        if (route.protected) {
            showToast("Invalid Session redirecting to login", "info");
            goTo("/signin");
        }
        return false;
    }
    const response = await fetch("http://localhost:8000/index.php/user", {
        method: "GET",
        credentials: "include",
        headers: {
            "Authorization": `Bearer ${session_token}`
        },
    });

    if (!response.ok && route.protected) {
        user = null;
        showToast("Invalid Session redirecting to login", "info");
        goTo("/signin");
        return false
    } else {
        const result = await response.json();
        user = new User(result.user);
        if (!route.protected) {
            goTo("/");
        }
        return true
    }
}

