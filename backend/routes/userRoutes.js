import express from "express";
import { getUsers , registerUser, deleteUser, profile, verifyOtp, changePassword, login} from "../controller/userController.js";
const  route = express.Router();

route.get('/',getUsers);
route.post('/login/', login);
route.post('/register/', registerUser);
route.post('/delete/', deleteUser);
route.post('/verify-otp/', verifyOtp);
route.post('/profile/', profile);
route.post('/change-password/',changePassword);
export default route;