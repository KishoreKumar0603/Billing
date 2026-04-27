import express from "express";
import { getUsers ,deleteUser, profile, changePassword} from "../controller/userController.js";
const  route = express.Router();

route.get('/',getUsers);
route.post('/delete/', deleteUser);
route.get('/profile/', profile);
route.post('/change-password/',changePassword);
export default route;