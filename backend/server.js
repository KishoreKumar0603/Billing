import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import billRoutes from './routes/billRoutes.js';
import cors from "cors"

dotenv.config();

const alllowedOrigin = ["http://localhost:5173"] 

const app = express();
app.use(express.json());
app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET", "POST",  "PUT", "DELETE"],
    credentials:true
}));

app.use('/api',userRoutes);
app.use('/api/bill', billRoutes);

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
.then(() =>{
    console.log(`Mongo DB Connected to URL : ${process.env.MONGODB_CONNECTION_STRING}`);
    app.listen(process.env.PORT | 5000, () => console.log(`Server is Running on PORT : ${process.env.PORT | 5000}`))
})
.catch((err) =>
{
    console.error("Error : ", err);
});

