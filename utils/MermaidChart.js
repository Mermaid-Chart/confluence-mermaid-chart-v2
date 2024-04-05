import {v4 as uuid} from 'uuid';
import fetch from 'node-fetch';
import {getEncodedSHA256Hash} from './index.js';

const defaultBaseURL = 'https://www.mermaidchart.com';
const authorizationURLTimeout = 60000;

class MermaidChart {
    static instance;

    clientID;
    baseURL;
    axios;
    pendingStates = {};
    redirectURI;
    URLS = {
        oauth: {
            authorize: (params) =>
                `/oauth/authorize?${new URLSearchParams(
                    Object.entries(params),
                ).toString()}`,
            token: `/oauth/token`,
        },
        rest: {
            users: {
                self: `/rest-api/users/me`,
            },
            documents: {
                get: (documentID) => {
                    return `/rest-api/documents/${documentID}`;
                },
            },
            projects: {
                list: `/rest-api/projects`,
                get: (projectID) => {
                    return {
                        documents: `/rest-api/projects/${projectID}/documents`,
                    };
                },
            },
        },
        raw: (
            document,
            theme = 'light',
        ) => {
            const base = `/raw/${document.documentID}?version=v${document.major}.${document.minor}&theme=${theme}&format=`;
            return {
                html: base + 'html',
                svg: base + 'svg',
                png: base + 'png',
            };
        },
        diagram: (
            d,
        ) => {
            const base = `/app/projects/${d.projectID}/diagrams/${d.documentID}/version/v${d.major}.${d.minor}`;
            return {
                self: base,
                edit: base + '/edit',
                view: base + '/view',
            };
        },
    };

    constructor({clientID, baseURL, redirectURI}) {
        if (MermaidChart.instance) {
            return MermaidChart.instance;
        }
        MermaidChart.instance = this;

        this.clientID = clientID;
        this.setBaseURL(baseURL || defaultBaseURL);
        if (redirectURI) {
            this.setRedirectURI(redirectURI);
        }
    }

    setRedirectURI(redirectURI) {
        this.redirectURI = redirectURI;
    }

    setBaseURL(baseURL = defaultBaseURL) {
        if (this.baseURL && this.baseURL === baseURL) {
            return;
        }
        this.baseURL = baseURL;
    }

    async getAuthorizationData({
        state,
        scope,
    } = {}) {
        if (!this.redirectURI) {
            throw new Error('redirectURI is not set');
        }

        const stateID = state ?? uuid();

        this.pendingStates[stateID] = {
            codeVerifier: uuid(),
        };

        const params = {
            client_id: this.clientID,
            redirect_uri: this.redirectURI,
            response_type: 'code',
            code_challenge_method: 'S256',
            code_challenge: await getEncodedSHA256Hash(
                this.pendingStates[stateID].codeVerifier,
            ),
            state: stateID,
            scope: scope ?? 'email',
        };

        // Deletes the state after 60 seconds
        setTimeout(() => {
            delete this.pendingStates[stateID];
        }, authorizationURLTimeout);

        const url = `${this.baseURL}${this.URLS.oauth.authorize(params)}`;
        return {
            url,
            state: stateID,
            scope: params.scope,
        };
    }

    async handleAuthorizationResponse(query) {
        const authorizationToken = query.get('code');
        const state = query.get('state');

        if (!authorizationToken) {
            throw new RequiredParameterMissingError('token');
        }
        if (!state) {
            throw new RequiredParameterMissingError('state');
        }

        const pendingState = this.pendingStates[state];
        // Check if it is a valid auth request started by the extension
        if (!pendingState) {
            throw new OAuthError('invalid_state');
        }

        const tokenResponse = await fetch(this.baseURL + this.URLS.oauth.token,
            {
                method: 'post',
                body: JSON.stringify({
                    client_id: this.clientID,
                    redirect_uri: this.redirectURI,
                    code_verifier: pendingState.codeVerifier,
                    code: authorizationToken,
                }),
                headers: {
                    'Content-type': 'application/json',
                },
            });

        if (tokenResponse.statusCode !== 200) {
            throw new OAuthError('invalid_token');
        }

        return (await tokenResponse.json()).data.access_token;
    }

    /**
     * These two methods are used together in order to "persist" the data across the auth process
     * As this api object will be recreated on load of redirect call
     * It is used after getAuthorizationData is called, and before handleResponse to ensure that the state created
     * in getAuthData exists
     * */
    setPendingState(state, verifier) {
        this.pendingStates[state] = {
            codeVerifier: verifier,
        };
    }

    getCodeVerifier(state) {
        return this.pendingStates[state].codeVerifier;
    }

    async getUser(accessToken) {
        const response = await fetch(
            `${this.baseURL}${this.URLS.rest.users.self}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        return (await response.json()).data;
    }

    getEditURL(
        document,
    ) {
        const url = `${this.baseURL}${this.URLS.diagram(document).edit}`;
        return url;
    }

    async getDocumentAsPng(
        document,
        theme = 'light',
    ) {
        const png = await this.axios.get < string > (
            this.URLS.raw(document, theme).png
        );
        return png.data;
    }

    async getRawDocument(
        document,
        theme = 'light',
    ) {
        const raw = await this.axios.get < string > (
            this.URLS.raw(document, theme).svg
        );
        return raw.data;
    }
}

class RequiredParameterMissingError extends Error {
    constructor(parameterName) {
        super(`Required parameter ${parameterName} is missing`);
    }
}

class OAuthError extends Error {
    constructor(message) {
        super(message);
    }
}

export {
    MermaidChart,
};
