//middleware to check userId and haspremium plan

import { clerkClient } from "@clerk/express";

export const auth=async(req,res,next)=>{
    try {
        const {userId,has} = await req.auth;
        const hasPreimumPlan = await has({plan:'premium'});//if premium plan is there then it is true otherwise false;

        const user= await clerkClient.users.getUser(userId);
        if(!hasPreimumPlan && user.privateMetadata.free_usage){
            req.free_usage = user.privateMetadata.free_usage
        }
        else{
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetadata:{
                    free_usage:0
                }
            })
            req.free_usage=0;
        }
        req.plan = hasPreimumPlan ? 'premium':'free';
        next()
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}