import open from 'open';
import express from 'express';
import { createHttpTerminator } from 'http-terminator';

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import fs from 'fs';
import os from 'os';

const configureRouter = function (onClose) {
    let router = express.Router();

    router.get('/auth/google', passport.authenticate('google', { scope: ['email'] }));

    router.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/failure', failureMessage: true }), (req, res) => {
        res.redirect('/success');
    });

    router.get('/failure', (req, res) => {
        res.send('<h1>Something went wrong. Please try again.</h1>')
        onClose();
    })

    router.get('/success', (req, res) => {
        res.send('<h1>Authentication completed! You can now close this window.</h1>')
        onClose();
    })
    return router;
}

const configureGoogleAuth = function (resolve) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: '62634882478-vvqopahdpp96pqvog717ls1ue2oh79eo.apps.googleusercontent.com',
                clientSecret: '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',
                callbackURL: '/auth/google/callback'
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
        if(fs.existsSync(authFile)) {
            let authResult = JSON.parse(fs.readFileSync(authFile));
            resolve(authResult);
        }
        resolve({
            AccessToken: null,
            RefreshToken: null
        });
    });
}

const saveAuthenticationToLocalConfig = function (authResult) {
    let configFolder = os.homedir() + "/.md2blogger"
    if (!fs.existsSync(configFolder)) {
        fs.mkdirSync(configFolder);
    }
    fs.writeFileSync(configFolder + "/auth", JSON.stringify(authResult, null, 2), 'utf8');
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
            console.log(authResult);
        }

        configureGoogleAuth(setResult);

        let app = express();

        app.use(passport.initialize());

        let server = app.listen(0, () => {
            let httpTerminator = createHttpTerminator({ server });
            setTimeout(() => {
                if (server.listening) {
                    console.log("Ending process due timeout...");
                    httpTerminator.terminate();
                    resolve(authResult);
                }
            }, 15000);
            app.use('/', configureRouter(() => {
                httpTerminator.terminate();
                resolve(authResult);
            }));
            open("http://localhost:" + server.address().port + "/auth/google");
        });

    });
}

const authentication = function () {
    return readAuthenticationFromLocalConfig()
        .then((authResult) => {
            if(authResult.AccessToken) {
                return Promise.resolve(authResult);
            }
            else {
                return askForBrowserAuthentication()
                    .then(saveAuthenticationToLocalConfig);
            }
        });
}

export default authentication;