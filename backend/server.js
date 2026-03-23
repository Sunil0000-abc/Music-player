import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import songrouter from "./routes/song.js"
import cors from "cors"

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // your React app URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

app.use("/api",songrouter);

mongoose.connect(process.env.MONGO_URI)
  .then(()=> console.log("mongodb connected"))
  .catch((err)=>console.error(err))

app.listen(process.env.PORT , ()=>{
    console.log(`Server running on port ${process.env.PORT}`);
})  


export default app;