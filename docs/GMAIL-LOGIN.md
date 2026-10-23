# Gmail login on Apps Script

The web client uses an OpenID Connect redirect, rather than embedding Google Identity Services in the Apps Script googleusercontent iframe (Google rejects that iframe as an authorized JavaScript origin).

Configure a Web application OAuth client with the exact deployed /exec URL as its authorized redirect URI. Set Script Properties AUTH_MODE=OAUTH and OAUTH_CLIENT_ID to its public client ID. The client secret is not used, stored, or shipped. Deploy as the owner, with access for Google account holders. Keep the spreadsheet and report/backup folders private to the owner.

The login request uses only openid and email, response_type=id_token, a fresh state and nonce, and account selection. The callback checks both against sessionStorage before sending a token to the server; unsolicited callbacks are rejected and the URL fragment is cleared. The server validates Google's tokeninfo response, issuer, audience, expiration and verified email on requests, then checks active Users and per-operation roles. Browser claims alone never authorize access. Tokens stay in memory and expire; refreshing the app requires signing in again.

Google's basic identity scope exception allows sign-in without adding everyone as OAuth test users, even while the Cloud console labels the app Testing. Do not add Drive, Gmail, or other scopes to this client without revisiting that configuration.

Reference: https://support.google.com/cloud/answer/15549945?hl=en

Administrators must add real authorized users, departments, curricula and teaching assignments using the app. Never use preview fixture identities as production users. Teacher identities and validated curriculum contents are supplied by the school, not invented by the application.

