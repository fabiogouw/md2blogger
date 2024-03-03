import axios from "axios";
import { createHttpTerminator } from "http-terminator";
import express from "express";
import fs from "fs";
import open from "open";
import os from "os";

const GoogleCredentials = {
    CliendId: "62634882478-q82bqsiutgjnnqgrgviq2l652cs7rsps.apps.googleusercontent.com"
}

const configureRouter = function (onClose, onAuthenticate) {
    let router = express.Router();

    router.get("/auth/google/callback", (req, res) => {
        if(!req.query.access_token) {
            res.send(`<html>
                <head><title>Redirecting...</title>
                <script>
                    function redirect() {
                        window.location.href = window.location.origin + window.location.pathname + window.location.hash.replace("#", "?");
                    }
                    </script></head>
                <body>
                    <script>
                    redirect();
                    </script>
                <body>
            </html>`);
        }
        else {
            onAuthenticate(req.query.access_token)
            res.redirect("/success");
        }
    })

    router.get("/failure", (req, res) => {
        res.send(`<html>
            <head>
                <title>Markdown to Blogger</title>
            </head>
            <body>
            <h1>Something went wrong. Please try again.</h1>
            </body>
        </html>`);
        onClose();
    })

    router.get("/success", (req, res) => {
        res.send(`<html>
            <head>
                <title>Markdown to Blogger</title>
            </head>
            <body>
            <h1>Authentication completed! You can now close this window.</h1>
            </body>
        </html>`);
        onClose();
    })
    return router;
}

const readAuthenticationFromLocalConfig = function () {
    return new Promise((resolve) => {
        let configFolder = os.homedir() + "/.md2blogger";
        let authFile = configFolder + "/auth";
        if (fs.existsSync(authFile)) {
            let authResult = JSON.parse(fs.readFileSync(authFile));
            resolve(authResult);
        }
        resolve({
            AccessToken: null
        });
    });
}

const validateToken = async function (authResult) {
    try {
        let response = await axios.get("https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + authResult.AccessToken);
        return response.status === 200;
    } catch (error) {
        console.error(error.response.data);
        return false;
    }
}

const saveAuthenticationToLocalConfig = function (authResult) {
    if (authResult.AccessToken) {
        let configFolder = os.homedir() + "/.md2blogger"
        if (!fs.existsSync(configFolder)) {
            fs.mkdirSync(configFolder);
        }
        fs.writeFileSync(configFolder + "/auth", JSON.stringify(authResult, null, 2), "utf8");
    }
    return authResult;
}

const askForBrowserAuthentication = function () {
    return new Promise((resolve) => {

        let authResult = {
            AccessToken: null
        };

        let setResult = function (accessToken) {
            authResult = {
                AccessToken: accessToken,
            };
        }

        let app = express();

        let port = 5623;
        let server = app.listen(port, () => {
            let httpTerminator = createHttpTerminator({ server });
            let timeoutId = setTimeout(() => {
                if (server.listening) {
                    console.log("Terminating authentication process due timeout...");
                    httpTerminator.terminate();
                    resolve(authResult);
                }
            }, 60000);
            app.use('/', configureRouter(() => {
                clearTimeout(timeoutId);
                httpTerminator.terminate();
                resolve(authResult);
            },
            (access_token) => {
                setResult(access_token);
            }));
            let redirectUri = encodeURIComponent(`http://localhost:${port}/auth/google/callback`);
            let scopes = encodeURIComponent("https://www.googleapis.com/auth/photoslibrary https://www.googleapis.com/auth/blogger");
            let url = `https://accounts.google.com/o/oauth2/v2/auth?scope=${scopes}&include_granted_scopes=true&response_type=token&redirect_uri=${redirectUri}&client_id=${GoogleCredentials.CliendId}`
            open(url);
        });
    });
}

const authentication = async function () {
    let authResult = await readAuthenticationFromLocalConfig();
    if (authResult.AccessToken && await validateToken(authResult)) {
        return Promise.resolve(authResult);
    }
    return askForBrowserAuthentication()
        .then(saveAuthenticationToLocalConfig);
}

export default authentication;