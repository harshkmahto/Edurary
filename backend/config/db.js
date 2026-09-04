import mongoose from "mongoose";
import config  from "./config.js";

const connectDB = async ()=>{

 try {
   const dbConn = await mongoose.connect(config.DB_URI);
   console.log(`DB is connected`);
 } catch (error) {
    console.log('Databse Connection Error', error.message);
    process.exit(1);  
 }
}

export default  connectDB;  