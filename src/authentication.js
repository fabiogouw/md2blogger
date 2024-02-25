import open from 'open';
import express from 'express';
import session from 'express-session';
import { createHttpTerminator } from 'http-terminator';

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const configureRouter = function(onClose) {
    let router = express.Router();

    router.get('/auth/google', passport.authenticate('google', { scope: ['email'] }));

    router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/failure', failureMessage: true }), (req, res) => {
        res.redirect('/success');
    });

    router.get('/failure', (req, res) => {
        res.send('<h1>Something went wrong. Please try again.</h1>')
        onClose();
    })

    router.get('/success', (req, res) => {
        console.log("sucess")
        res.send('<h1>Authentication completed! You can now close this window.</h1>')
        onClose();
    })
    return router;
}

const askForBrowserAuthentication = function () {

    return new Promise((resolve) => {

        let authResult = {
            AccessToken: null,
            RefreshToken: null
        };

        passport.use(
            new GoogleStrategy(
                {
                    clientID: '62634882478-vvqopahdpp96pqvog717ls1ue2oh79eo.apps.googleusercontent.com',
                    clientSecret: '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',
                    callbackURL: '/auth/google/callback'
                },
                (accessToken, refreshToken, profile, done) => {
                    authResult = {
                        AccessToken: accessToken,
                        RefreshToken: refreshToken
                    };
                    return done(null, profile);
                }
            )
        );

        passport.serializeUser((user, done) => {
            done(null, user)
        });

        passport.deserializeUser((id, done) => {
            done(null, id)
        });

        let app = express();

        app.use(session({ secret: 'YOUR_SESSION_SECRET', resave: false, saveUninitialized: false }));
        app.use(passport.initialize());

        let server = app.listen(0, () => {
            console.log("Server started on port " + server.address().port);
            let httpTerminator = createHttpTerminator({ server });
            setTimeout(() => {
                if (server.listening) {
                    console.log("Ending process due timeout...");
                    httpTerminator.terminate();
                    resolve(authResult);
                }
            }, 15000);
            app.use('/', configureRouter(() => {
                console.log("terminating ok...")
                httpTerminator.terminate();
                resolve(authResult);
            }));
            open("http://localhost:" + server.address().port + "/auth/google");
        });

    });
}

const authentication = function () {
    return askForBrowserAuthentication();
}

export default authentication;