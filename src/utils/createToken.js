import jwt from "jsonwebtoken";

export function createToken(userDoc) {
    const payload = {
        id: userDoc._id,
        email: userDoc.email,
    };
    const token = jwt.sign(payload, process.env.TOKEN_SIGNATURE);
    return token;
}