import { User } from "@/modules/user/user.model";
import { ResponseError } from "@/utils/response-error.utils";
import passport from "passport";
import { randomBytes } from "crypto";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env";

console.log(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.BASE_URL);

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.BASE_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // cek apakah user sudah ada
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(
            new ResponseError(400, "Email tidak tersedia dari Google"),
            false
          );
        }
        let user = await User.findOne({ email });
        if (user) {
          if (user.role !== "tenant") {
            // ❌ Sudah terdaftar tapi bukan tenant → tidak boleh login Google
            return done(
              new ResponseError(
                401,
                "Email sudah digunakan oleh pengguna lain"
              ),
              false
            );
          }
          return done(null, user);
        }
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          password: randomBytes(16).toString("hex"),
          phone: "",
          avatarUrl: profile.photos?.[0]?.value,
          role: "tenant", // default role bisa tenant
          isVerified: true,
        });
        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;
