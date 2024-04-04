import {fetchToken, saveToken} from '../utils/index.js';
import {MermaidChart} from '../utils/MermaidChart.js';

const MC_BASE_URL = process.env.MC_BASE_URL || "https://www.mermaidchart.com";

export default function routes(app, addon) {
  const mermaidAPI = new MermaidChart({
    baseURL: MC_BASE_URL,
    clientID: process.env.MC_CLIENT_ID || "505827bd-631d-4bf7-b0a6-44ae0b6547b5",
    redirectURI: `${addon.config.localBaseUrl()}/callback`,
  })

  app.get("/", (req, res) => {
    res.redirect("/atlassian-connect.json");
  });

  app.post("/token", addon.checkValidToken(), async (req, res) => {
    const token = req.body.token;
    if (!token) {
      return res.status(400).end();
    }
    try {
      await saveToken(req.context.http, req.context.userAccountId, token)
      res.status(201).end();
    } catch (e) {
      console.error(e)
      res.status(503).end();
    }
  })

  app.get("/viewer", addon.authenticate(), (req, res) => {
    res.render("viewer.hbs");
  });

  app.get("/editor", addon.authenticate(), async (req, res) => {
    let access_token, user;
    try {
      access_token = await fetchToken(req.context.http, req.context.userAccountId)
      console.log('access_token', access_token);
      user = access_token ? await mermaidAPI.getUser(access_token) : undefined
    } catch (e) {}

    res.render("editor.hbs", {
      MC_BASE_URL: MC_BASE_URL,
      mcAccessToken: user ? access_token : '',
      loginUrl: (await mermaidAPI.getAuthorizationData()).url
    });
  });

  app.get("/callback", async (req, res) => {
    let accessToken, errorMessage;
    // try {
    //   accessToken = await mermaidAPI.handleAuthorizationResponse(req.query)
    // } catch (e) {
    //   errorMessage = e.message;
    // }

    accessToken = "test"
    res.render("authCallback.hbs", {
      accessToken,
      errorMessage
    })

  })
}
