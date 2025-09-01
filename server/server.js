//create the basic express server 

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware ,requireAuth} from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoutes.js';


//create app using express function
const app = express()

await connectCloudinary()

app.use(cors()) //middleware all the request will pass through the cors package 
app.use(express.json()) //all the request will be passed in the json method
app.use(clerkMiddleware())

//creating the routes
app.get('/',(req,res)=>res.send('Server is Live!'));
app.use(requireAuth());//helps to protect the routes from accessing by unauthorized users 

app.use('/api/ai',aiRouter);
app.use('/api/user',userRouter)
const port=process.env.PORT || 3000;

app.listen(port,"0.0.0.0",()=>{
    console.log(`Server is running on port ${port}`)
})