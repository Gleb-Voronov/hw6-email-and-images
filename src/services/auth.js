import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/User.js";
import Session from "../models/Session.js";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createHttpError(409, "Email in use");

  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ name, email, password: hashedPassword });
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, "Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw createHttpError(401, "Invalid email or password");

  await Session.deleteOne({ userId: user._id });

  const accessToken = jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

export const refreshSession = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw createHttpError(401, "No refresh token");

  const session = await Session.findOne({ refreshToken: oldRefreshToken });
  if (!session) throw createHttpError(401, "Invalid refresh token");
  if (new Date() > session.refreshTokenValidUntil) throw createHttpError(401, "Refresh token expired");

  await Session.deleteOne({ _id: session._id });

  const accessToken = jwt.sign({ id: session.userId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const newRefreshToken = jwt.sign({ id: session.userId }, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });

  await Session.create({
    userId: session.userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, newRefreshToken };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) throw createHttpError(401, "No refresh token");
  await Session.deleteOne({ refreshToken });
};
