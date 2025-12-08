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
 * File Created: Sunday, 7th December 2025 5:57:30 pm
 * Author: Hicham S.Meftah (hichammeftah4@gmail.com)
 */

export default function DetailedAvatar({ username, profileImage, size = 40 }) {
  if (!username) return null;

  const avatarSrc = profileImage || '';
  const avatarAlt = username || 'Camagru User';

  const container = document.createElement('div');
  container.classList.add("flex", "items-center", "gap-2");

  container.innerHTML = `
    <img 
      src="${avatarSrc}" 
      alt="${avatarAlt}" 
      style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover;"
    />
    <div class="user-details">
      <span class="user-name" style="font-weight: bold;">${username}</span>
    </div>
  `;

  return container;
}
