import User from "../models/userModel.js";
import jwt, { decode } from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendMail from "../middleware/sendMail.js";

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

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPass } = req.body;
    if (!name || !email || !phone || !password || !confirmPass) {
      return res.json({
        error: "All fields are required",
      });
    }

    if (confirmPass != password) {
      return res.json({
        error: "Password doesn't match",
      });
    }

    const isExistingUser = (await User.findOne({ email })) ? true : false;
    if (isExistingUser) {
      return res.json({
        error: "User Already Exists... try different mail Id",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const activationKey = jwt.sign(
      { name, email, otp, password, phone },
      process.env.ACTIVATION_SECRET,
      { expiresIn: "5m" }
    );

  const mailContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="text-align: center; color:rgb(0, 0, 0);">Billing-It - OTP Verification</h2>
    <p style="color: #333; text-align: center;">Hello <strong>${name}</strong>,</p>
    <p style="color: #555; text-align: center;">We received a request to verify your email address for your Billing-It account.</p>

    <p style="text-align: center; font-size: 18px; color: #333; font-weight: bold;">Your OTP Code:</p>
    <div style="text-align: center; background: rgba(124, 124, 124, 0.82); color: white; padding: 15px; font-size: 24px; font-weight: bold; border-radius: 5px;">
      ${otp}
    </div>

    <div style="text-align: center; margin-top: 15px;">
      <span style="background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 4px; display: inline-block; font-weight: bold;">
        Copy this OTP manually
      </span>
    </div>

    <p style="text-align: center; color: #777; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.</p>

    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="text-align: center; font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
    <p style="text-align: center; font-size: 12px; color: #999;">&copy; 2025 Billing-It. All rights reserved.</p>
  </div>
`;


    await sendMail(email, "Billing - OTP verification", mailContent);
    return res.json({
      message: "Otp sent to registered mail...",
      activationKey
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const {otp, activationKey} = req.body;
    if(!activationKey){
      return res.json({
        error:"Activation Key is Missing"
      })
    }
    let decoded;
    try {
      
      decoded = jwt.verify(activationKey, process.env.ACTIVATION_SECRET);
    } catch (error) {
      return res.json({
        error:error.message
      })
    }

    if(decoded.otp.toString() != otp){
      return res.json({
        error:"OTP Mismatch... Check email"
      })
    }

    const isExistingUser =  await User.findOne({email: decoded.email});
    if(isExistingUser){
      return  res.json({
        error:"User Already Exist... Try login"
      });
    }
    
    await User.create({
      name:decoded.name,
      email: decoded.email,
      password: decoded.password,
      phone: decoded.phone
    });

    return res.json({
      message:"Registration Successfull"
    })


  } catch (error) {
    return res.json({
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        error: "Both  Fields Required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "User Not Found",
      });
    }

    if (!(await user.matchPassword(password))) {
      return res.json({
        error: "Invalid Credentials...",
      });
    }
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:"15d"});

    return res.json({
      message: "Login Successfull",
      token
    });
  } catch (error) {
    return res.json({ error: error.message });
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