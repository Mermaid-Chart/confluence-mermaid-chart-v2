import {h} from 'https://esm.sh/preact';
import {useEffect, useState} from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function Login({onLogin}) {
    const [error, setError] = useState('');
    useEffect(() => {
        window.addEventListener('message', async (e) => {
            const action = e.data.action;
            if (action === 'token') {
                const token = e.data.data;
                const res = await fetch('/token', {
                    method: 'post',
                    body: JSON.stringify({token}),
                    headers: {
                        Authorization: `JWT ${JWTToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (res.status !== 201) {
                    setError('Something went wrong. Please try later');
                } else {
                    onLogin(token);
                }
            }
        });
    }, []);

    const onLoginClick = () => {
        const width = 500;
        const height = 650;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);
        let options = 'width=' + width;
        options += ',height=' + height;
        options += ',top=' + top;
        options += ',left=' + left;
        const windowObjectReference = window.open(loginUrl, 'loginWindow',
            options);
        windowObjectReference.focus();
        return false;
    };

    return html`
        <div id="login-container">
            <button id="login-button" onClick="${onLoginClick}">
                ${error ? html`<h3 class="error">${error}</h3>` : ''}
                <img src="/enter.svg" alt="Login" width="200"/>
                <span>Login</span>
            </button>
        </div>
    `;
}
