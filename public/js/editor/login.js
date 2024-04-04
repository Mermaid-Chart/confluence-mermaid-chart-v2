import {h} from 'https://esm.sh/preact';
import {useEffect} from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function Login({onLogin}) {
    useEffect(() => {
        window.onmessage = function(e) {
            const action = e.data.action;
            if (action === 'token') {
                fetch("/token", {
                    method: 'post',
                    body: JSON.stringify({token: e.data.data})
                })
            }
        };
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
        const windowObjectReference = window.open('{{loginUrl}}', 'loginWindow',
            options);
        windowObjectReference.focus();
        return false;
    };

    return html`
        <div id="login-container">
            <button id="login-button" onClick="${onLoginClick}">
                <img src="/enter.svg" alt="Login" width="200"/>
                <span>Login</span>
            </button>
        </div>
    `;
}
