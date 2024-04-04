import {fetchToken, saveToken} from '../utils/index.js';
import {MermaidChart} from '../utils/MermaidChart.js';

export default function routes(app, addon) {
  const mermaidAPI = new MermaidChart({
    baseURL: process.env.MC_BASE_URL || "https://www.mermaidchart.com",
    clientID: process.env.CLIENT_ID || "505827bd-631d-4bf7-b0a6-44ae0b6547b5",
    redirectURI: `${addon.config.localBaseUrl()}/callback`,
  })

  app.get("/", (req, res) => {
    res.redirect("/atlassian-connect.json");
  });

  app.post("/token", addon.checkValidToken(), (req, res) => {
    const token = res.body.token;
    if (!token) {
      return res.status(400).end();
    }
    saveToken(req.context.http, req.context.userAccountId, token)
  })

  app.get("/viewer", addon.authenticate(), (req, res) => {
    res.render("viewer.hbs");
  });

  app.get("/editor", addon.authenticate(), async (req, res) => {
    let access_token, user;
    try {
      access_token = await fetchToken(req.context.http, req.context.userAccountId)
      user = access_token ? await mermaidAPI.getUser(access_token) : undefined
    } catch (e) {

    }

    res.render("editor.hbs", {
      mcEditorUrl: `${process.env.MC_BASE_URL}/app/plugins/confluence/select`,
      mcEditorEditUrl: `${process.env.MC_BASE_URL}/app/projects/`,
      mcAccessToken: user ? access_token : '',
    });
  });

  app.get("/callback", async (req, res) => {
    let accessToken, errorMessage;
    try {
      accessToken = await mermaidAPI.handleAuthorizationResponse(req.query)
    } catch (e) {
      errorMessage = e.message;
    }

    res.render("authCallback.hbs", {
      accessToken,
      errorMessage
    })

  })
}
