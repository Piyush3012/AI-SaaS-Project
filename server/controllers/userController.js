//get the user creations

import sql from "../config/db.js";

export const getUserCreations = async (req,res)=>{
    try {
        const { userId }=req.auth();

        const creations = await sql `SELECT * FROM CREATIONS
        WHERE user_id=${userId}
        ORDER BY created_at DESC`;

        res.json({success:true,creations})

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
        
    }
}

//get the publish creations

export const getPublishCreations = async (req,res)=>{
    try {

        const creations = await sql `SELECT * FROM CREATIONS
        WHERE publish = true
        ORDER BY created_at DESC`;

        res.json({success:true,creations})

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
        
    }
}

//togglelikecreation

export const toggleLikeCreation = async (req,res)=>{
    try {
        const { userId } = req.auth()
        const { id } = req.body;

        const [creation] = await sql `SELECT * FROM creations 
        where id = ${id}`

        if(!creation){
            return res.json({success:false,message:"Creation not found"})
            }

        let currentLikes = creation.likes || [];
        if (typeof currentLikes === "string") {
        currentLikes = currentLikes.replace(/[{}]/g, "").split(",").filter(Boolean);
        }
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)) {
            updatedLikes=currentLikes.filter((user)=>user !== userIdStr)
            message= 'Creation Unliked'

        }
        else{
            updatedLikes=[...currentLikes,userIdStr]
            message = 'Creation Liked'

        }

        const formattedArray=`{${updatedLikes.join(',')}}` 
        
        await sql`UPDATE creations SET likes=${formattedArray}::text[] where id=${id}`

        res.json({success:true,message})

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
        
    }
}