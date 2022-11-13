const bcrypt = require("bcrypt");
const LocalStrat = require("passport-local");

async function initialize(passport, getCustomerByUsername) {
    const authenticateUser = async (username, password, done) => {
        const x = await getCustomerByUsername(username);
        const user = x[0];

        if (user == null) {
            return done(null, false, { message: "No user with that username" });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            }
            return done(null, false, { message: "Password incorrect" });
        } catch (e) {
            console.log(e);
        }
    };

    passport.use(
        "local",
        new LocalStrat(
            { usernameField: "user", passwordField: "pass" },
            authenticateUser
        )
    );

    passport.serializeUser((user, done) => {
        done(null, {
            id: user.user_id,
            username: user.username,
            role: user.role,
        });
    });
    passport.deserializeUser((user, done) => {
        done(null, getCustomerByUsername(user.username));
    });
}

module.exports = initialize;
