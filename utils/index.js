import {Buffer} from 'buffer';

const fetchToken = async (httpClient, atlassianAccountId) => {
    return new Promise((resolve, reject) => {
        httpClient.asUserByAccountId(atlassianAccountId).get(
            {
                url: `/rest/api/user/${atlassianAccountId}/property/token?jsonValue=true`,
                headers: {
                    'Accept': 'application/json',
                },
            },
            function(err, _, body) {
                if (err) {
                    console.error(
                        'Failed on reading user property "token"',
                    );
                    reject(err);
                    return;
                }
                const response = JSON.parse(body);
                const token = (response.value || {}).token || '';
                resolve(token);
            },
        );
    });
};
const saveToken = async (httpClient, atlassianAccountId, token) => {
    return new Promise((resolve, reject) => {
        httpClient.asUserByAccountId(atlassianAccountId).put(
            {
                url: `/rest/api/user/${atlassianAccountId}/property/token`,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({value: {token}}),
            },
            function(err) {
                if (err) {
                    console.error(
                        'Failed on saving user property "token"',
                    );
                    reject(err);
                    return;
                }
                resolve(token);
            },
        );
    });
};

const getEncodedSHA256Hash = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);

    return Buffer.from(hash).
        toString('base64').
        replace(/\+/g, '-').
        replace(/\//g, '_').
        replace(/=+$/, '');
};

export {
    fetchToken,
    saveToken,
    getEncodedSHA256Hash,
};
