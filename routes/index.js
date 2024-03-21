import fetch from "node-fetch";

export default function routes(app, addon) {
  const fetchToken = async (req) => {
    return new Promise((resolve, reject) => {
      const httpClient = addon.httpClient(req);
      httpClient.get(
        "/rest/atlassian-connect/1/addons/mermaid-chart-app/properties/security_token?jsonValue=true",
        function (err, _, body) {
          if (err) {
            console.error(
              'Failed on reading application property "security_token"'
            );
            reject(err);
            return;
          }
          const response = JSON.parse(body);
          resolve((response.value || {}).securityToken || "");
        }
      );
    });
  };

  app.get("/", (req, res) => {
    res.redirect("/atlassian-connect.json");
  });
  app.get("/diagram", addon.checkValidToken(), async (req, res) => {
    try {
      const token = await fetchToken(req);
      const { documentID, major, minor } = req.query;
      const response = await fetch(
        `https://www.mermaidchart.com/raw/${documentID}?version=v${major}.${minor}&theme=light&format=svg`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      res.set("Content-Type", "image/svg+xml");
      res.write(await response.text());
      res.end();
    } catch (e) {
      console.error(e);
      res.status(503).end();
    }
  });
  app.get("/viewer", addon.authenticate(), (req, res) => {
    res.render("viewer.hbs");
  });
  app.get("/editor", (req, res) => {
    res.render("editor.hbs", {
      mcEditorUrl: process.env.MC_EDITOR_URL,
      mcEditorEditUrl: process.env.MC_EDITOR_EDIT_URL,
    });
  });
  app.get("/settings", addon.authenticate(), async (req, res) => {
    try {
      res.render("settings.hbs", {
        securityToken: await fetchToken(req),
      });
    } catch (e) {
      res.render("error.hbs");
    }
  });
  app.post("/settings", addon.checkValidToken(), async (req, res) => {
    const { securityToken } = req.body;
    const userResponse = await fetch(
      `https://www.mermaidchart.com/rest-api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${securityToken}`,
        },
      }
    );
    if (!userResponse.ok) {
      res.status(400).end();
      return;
    }

    const httpClient = addon.httpClient(req);
    httpClient.put(
      {
        url: "/rest/atlassian-connect/1/addons/mermaid-chart-app/properties/security_token",
        body: JSON.stringify({ securityToken }),
      },
      function (err) {
        if (err) {
          console.error(err);
          res.status(503).end();
        }
        res.end();
      }
    );
  });
}
