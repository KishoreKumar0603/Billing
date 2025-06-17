import express from 'express';
import { addBill,deleteBill,getAllBills, updateBill } from '../controller/billContoller.js';


const route = express.Router();

route.get('/', getAllBills);
route.post('/add/', addBill);
route.post('/update/', updateBill);
route.post('/delete/', deleteBill);

export default route;