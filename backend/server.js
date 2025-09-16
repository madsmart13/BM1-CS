import express from "express";
import session from "express-session";
import passport from "passport";
import SteamStrategy from "passport-steam";
import fetch from "node-fetch";

const app = express();

// Middleware
app.use(express.json());
app.use(session({ secret: "bm-cs-secret", resave: false, saveUninitialized: true }));

// Passport Steam
passport.use(new SteamStrategy({
    returnURL: process.env.BASE_URL + "/auth/steam/return",
    realm: process.env.BASE_URL,
    apiKey: process.env.STEAM_API_KEY
}, (identifier, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/auth/steam", passport.authenticate("steam"));
app.get("/auth/steam/return",
    passport.authenticate("steam", { failureRedirect: "/" }),
    (req, res) => res.redirect("/dashboard")
);

app.get("/api/me", (req, res) => {
    if (!req.user) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, user: req.user });
});

// ذخیره لینک ترید
app.post("/api/save_trade", (req, res) => {
    const { tradeUrl } = req.body;
    // TODO: validate و ذخیره در DB
    return res.json({ success: true, tradeUrl });
});

// شروع سرور
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`BM CS backend running on port ${port}`));
