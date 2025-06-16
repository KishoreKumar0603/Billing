import express from 'express';
import { addBill,getAllBills } from '../controller/billContoller.js';


const route = express.Router();

route.get('/',getAllBills);
route.post('/add/',addBill);

export default route;