// used as an middleware to upload the files to the server 
import multer from "multer";

const storage=multer.diskStorage({});

export const upload = multer({storage})
