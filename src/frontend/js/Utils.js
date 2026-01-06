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
 * File Created: Tuesday, 2nd December 2025 1:38:36 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

import { InjectAnchors } from "./Router.js";
import Tooltip from "../components/Tooltip.js";

export function goTo(url, delay = 0) {
    const a = document.createElement('a');
    a.href = url;
    InjectAnchors(a);
    setTimeout(() => a.click(), delay * 1000);
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
}

export function formatTimestamp(dateStr) {
    const now = Date.now();
    let date = dateStr;
    if (date && !date.includes('T') && !date.includes('Z')) {
        date = date.replace(' ', 'T') + 'Z';
    }
    const diff = (now - Date.parse(date)) / 1000;
    
    if (diff < 15) return "Just now";
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < (86400 * 7)) return `${Math.floor(diff / 86400)}d`;
    if (diff < (86400 * 30)) return `${Math.floor(diff / (86400 * 7))}w`;
    if (diff < (86400 * 365)) return `${Math.floor(diff / (86400 * 30))}mo`;
    return `${Math.floor(diff / (86400 * 365))}y`;
}
