import User from "../models/userModel.js";
import jwt, { decode } from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendMail from "../utils/sendMail.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.json({
        message: "Users Count 0",
      });
    }
    return res.json(users);
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({
        error: "Email Required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "User not Found",
      });
    }

    await User.findOneAndDelete({ email });
    return res.json({
      message: "User Deleted Successfully",
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

export const profile = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        error: "Email missing",
      });
    }
    const user = await User.find({ email }).select("-password");
    return res.json(user);
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const {password, confirmPassword , newPassword, token
    }  = req.body;
    console.log(`${password} ${confirmPassword} ${newPassword}`);
    if(!password || !confirmPassword || !newPassword || !token){
      return res.json({
        error:"All field required"
      });
    }

    if(password != confirmPassword){
      return res.json({
        error:"Confirm password should be same as old"
      });
    }
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    const isMatch = await user.matchPassword(password);
    if(!isMatch){
      return res.json({
        error: "Password doesn't match with actual password"
      });
    } 
    if(await user.matchPassword(newPassword)){
      return  res.json({
        message:"You entered new password same as old"
      });
    }
    user.password = newPassword;
    await user.save();

    return res.json({
      message: "Password changed"
    });
  } catch (error) {
    return res.json({
      error: error.message
    });
  }
}