import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary';
import FormData from "form-data";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth;  // <-- fix
    const { prompt, length } = req.body;
    const plan = req.plan;        // <-- fix
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit Reached. Upgrade to continue."
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


//title generation controller function

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth;  // <-- fix
    const { prompt } = req.body;
    const plan = req.plan;        // <-- fix
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit Reached. Upgrade to continue."
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//image generator controller function

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth;         
    const { prompt, publish } = req.body;
    const plan = req.plan;               
    
    // check plan
    if (plan !== "premium" ) {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    // call ClipDrop API
    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth;         
    const image= req.file;
    const plan = req.plan;               
    
    // check plan
    if (plan !== "premium" ) {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    // function to remove the background using the cloudinary
    const { secure_url } = await cloudinary.uploader.upload(image.path,{
      transformation:[
        {
          effect:'background_removal',
          background_removal:'remove_the_background'
        }
      ]
    });


    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId},'Remove Background from image', ${secure_url}, 'image')
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth;   
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;               
    
    // check plan
    if (plan !== "premium" ) {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    // funcction to remove the background using the cloudinary
    const { public_id } = await cloudinary.uploader.upload(image.path);

    //remove the object from the image 
    const image_url = cloudinary.url(public_id,{
      transformation: [
        {
          effect:`gen_remove:${object}`
        }
      ],
      resource_type:'image'
    })


    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId},${`Removed ${object} from image`}, ${image_url}, 'image')
    `;

    res.json({ success: true, content: image_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//review resume code 
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth;   
    const resume  = req.file;
    const plan = req.plan;               
    
    // check plan
    if (plan !== "premium" ) {
      return res.json({
        success: false,
        message: "This feature is only available for premium users."
      });
    }

    // function to review the resume 
    if(resume.size > 5*1024*1024){
      return res.json({success:false,message:"Resume file size exceeds allowed size (5MB)."})
    }
     
    //convert this file into the data buffer 
    const dataBuffer = fs.readFileSync(resume.path)
    //pasring the resume
    const pdfData = await pdf(dataBuffer)

    //generating the prompt
    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n ${pdfData.text} `

    //now sending the prompt to gemini to get the score
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;



    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId},'Review the Uploaded resume', ${content}, 'resume-review')
    `;

    res.json({ success: true, content: content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

