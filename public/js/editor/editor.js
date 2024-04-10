import {h, render, Fragment} from 'https://esm.sh/preact';
import {useState} from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';
import {Login} from './login.js';
import {Form} from './form.js';
import {Header} from './header.js';

const html = htm.bind(h);

function App() {
    const [accessToken, setAccessToken] = useState(mcAccessToken);

    const onLogin = (token) => {
        setAccessToken(token);
    }
    const onLogout = async () => {
        await fetch('/logout', {
            method: 'post',
            headers: {
                Authorization: `JWT ${JWTToken}`,
            },
        });
        setAccessToken(undefined)
    }

    if (!accessToken) {
        return html`
            <${Login} onLogin="${onLogin}"/>
        `;
    }

    return html`
        <${Fragment}>
            <${Header} user="${user}" onLogout="${onLogout}" />
            <${Form} mcAccessToken="${accessToken}"/>
        </Fragment>
        
    `;
}

render(html`
    <${App}/>`, document.getElementById('editor-content'));
