import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user"
import bcrypt from "bcrypt"

interface SignUpBody {
  username?: string;
  email?: string;
  password?: string;
}

export const signUp: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const passwordRaw = req.body.password;

  try {
    if (!username || !email || !passwordRaw) {
      throw createHttpError(400, "Parameters missing");
    }

	const existingUsername = await UserModel.findOne({username: username}).exec();

	if(existingUsername){
		throw createHttpError(409, "Username already taken. Please choose a different one or log in instead");
	}

	const existingEmail = await UserModel.findOne({email: email}).exec();

	if(existingEmail){
		throw createHttpError(409, "A user with this email address already exists. Please log in instead");
	}

	const passwordHashed = await bcrypt.hash(passwordRaw, 10);

	const newUser = await UserModel.create({
		username: username,
		email: email,
		password: passwordHashed,
	});

	req.session.userId = newUser._id;

	res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};
