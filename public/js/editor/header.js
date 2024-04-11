import {h} from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function Header({user, onLogout}) {
    return html`
        <div id="header">
<!--            <img class="logo" src="/icon_80x80.png" alt="logo" />-->
            <div>
                ${user.fullName || user.email}
                <button class="logout" onclick="${onLogout}">Logout</button>
            </div>
        </div>
    `
}
