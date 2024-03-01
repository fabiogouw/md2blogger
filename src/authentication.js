import open from "open";
import express from "express";
import { createHttpTerminator } from "http-terminator";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import fs from "fs";
import os from "os";
import axios from "axios";

const GoogleCredentials = {
    CliendId: "62634882478-vvqopahdpp96pqvog717ls1ue2oh79eo.apps.googleusercontent.com",
    ClientSecret: "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"
}

const configureRouter = function (onClose) {
    let router = express.Router();

    router.get("/auth/google", passport.authenticate("google", { scope: ["email", "https://www.googleapis.com/auth/blogger"] }));

    router.get("/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/failure", failureMessage: true }), (req, res) => {
        res.redirect("/success");
    });

    router.get("/failure", (req, res) => {
        res.send("<h1>Something went wrong. Please try again.</h1>");
        onClose();
    })

    router.get("/success", (req, res) => {
        res.send("<h1>Authentication completed! You can now close this window.</h1>");
        onClose();
    })
    return router;
}

const configureGoogleAuth = function (resolve) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: GoogleCredentials.CliendId,
                clientSecret: GoogleCredentials.ClientSecret,
                callbackURL: "/auth/google/callback"
            },
            (accessToken, refreshToken, profile, done) => {
                resolve(accessToken, refreshToken);
                return done(null, profile);
            }
        )
    );
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
            AccessToken: null,
            RefreshToken: null
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

const askForTokenRefresh = async function (refreshToken) {
    try {
        let response = await axios.post("https://oauth2.googleapis.com/token", {
            grant_type: "refresh_token",
            client_id: GoogleCredentials.ClientID,
            client_secret: GoogleCredentials.ClientSecret,
            refresh_token: refreshToken
        });
        return {
            AccessToken: response.data.access_token,
            RefreshToken: refreshToken
        };
    } catch (error) {
        return {
            AccessToken: null,
            RefreshToken: null
        }
    }
}

const saveAuthenticationToLocalConfig = function (authResult) {
    if (authResult.AccessToken && authResult.RefreshToken) {
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
            AccessToken: null,
            RefreshToken: null
        };

        let setResult = function (accessToken, refreshToken) {
            authResult = {
                AccessToken: accessToken,
                RefreshToken: refreshToken
            };
        }

        configureGoogleAuth(setResult);

        let app = express();

        app.use(passport.initialize());

        let server = app.listen(0, () => {
            let httpTerminator = createHttpTerminator({ server });
            setTimeout(() => {
                if (server.listening) {
                    console.log("Terminating authentication process due timeout...");
                    httpTerminator.terminate();
                    resolve(authResult);
                }
            }, 30000);
            app.use('/', configureRouter(() => {
                httpTerminator.terminate();
                resolve(authResult);
            }));
            open("http://localhost:" + server.address().port + "/auth/google");
        });

    });
}

const authentication = async function () {
    let authResult = await readAuthenticationFromLocalConfig();
    if (authResult.AccessToken && await validateToken(authResult)) {
        return Promise.resolve(authResult);
    }
    authResult = await askForTokenRefresh(authResult.RefreshToken)
        .then(saveAuthenticationToLocalConfig);
    if (authResult.AccessToken) {
        return Promise.resolve(authResult);
    }
    return askForBrowserAuthentication()
        .then(saveAuthenticationToLocalConfig);
}

export default authentication;