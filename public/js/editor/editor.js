import {h, render} from 'https://esm.sh/preact';
import {useState} from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';
import {Login} from './login.js';
import {Form} from './form.js';

const html = htm.bind(h);

function App() {
    const [accessToken, setAccessToken] = useState(mcAccessToken);

    const onLogin = (token) => {
        setAccessToken(token);
    }

    if (!accessToken) {
        return html`
            <${Login} onLogin="${onLogin}"/>
        `;
    }

    return html`
        <${Form} mcAccessToken="${accessToken}"/>
    `;
}

render(html`
    <${App}/>`, document.getElementById('editor-content'));
