import {h, render} from 'https://esm.sh/preact';
import {useState} from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';
import {Login} from './login.js';
import {Form} from './form.js';

const html = htm.bind(h);

function App() {
    const [mcAccessToken, setMcAccessToken] = useState(window.mcAccessToken);

    if (!mcAccessToken) {
        return html`
            <${Login} onLogin="${(token) => setMcAccessToken(token)}"/>
        `;
    }

    return html`
        <${Form}/>
    `;
}

render(html`
    <${App}/>`, document.getElementById('editor-content'));
