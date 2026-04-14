import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import connectDB from './configs/db.js'
import adminRouter from './routes/adminRoutes.js'
import blogRouter from './routes/blogRoutes.js'
import { apiLimiter } from './middleware/security.js'

const app=express()
app.set('trust proxy', 1)

await connectDB()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url)=>url.trim()) : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))
app.options(/.*/, cors())
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use(apiLimiter)

app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.get("/",(req,res)=>{
    res.json({
        success:true,
        message:"API is working",
        services:{
            postgres:"connected"
        }
    })
})
app.use("/api/admin",adminRouter)
app.use("/api/blog",blogRouter)

const PORT=process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})

export default app
