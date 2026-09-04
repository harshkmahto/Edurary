import dotenv from 'dotenv';
dotenv.config()

if(!process.env.DB_URI){
    throw new Error("DB_URI Variable are missing")
}
if(!process.env.PORT){
    throw new Error("PORT Variable are missing")
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET Variable are missing")
}

if(!process.env.EMAIL_USER){
    throw new Error("Email USER variable are missing")
}

if(!process.env.EMAIL_PASS){
    throw new Error("Email PASS variable are missing") 
}


if(!process.env.CLIENT_URL){
    throw new Error("CLIENT_URL variable are missing") 
}

if(!process.env.IMAGEKIT_PUBLIC_KEY){
    throw new Error("IMAGEKIT_PUBLIC_KEY variable are missing") 
}

if(!process.env.IMAGEKIT_PRIVATE_KEY){
    throw new Error("IMAGEKIT_PRIVATE_KEY variable are missing") 
}

if(!process.env.IMAGEKIT_URL_ENDPOINT){
    throw new Error("IMAGEKIT_URL_ENDPOINT variable are missing") 
}



const cofig = {
    DB_URI: process.env.DB_URI,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    CLIENT_URL: process.env.CLIENT_URL,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    
}

export default cofig;