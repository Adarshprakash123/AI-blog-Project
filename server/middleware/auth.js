import jwt from 'jsonwebtoken'

const auth=(req,res,next)=>{
    const authHeader = req.headers.authorization || ''
    const headerToken = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim()
    const cookieToken = req.cookies?.accessToken
    const token = headerToken || cookieToken

    if(!token){
        return res.json({success:false,message:"Please authenticate first"})
    }

    try{
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
        if(decodedToken?.role !== "admin"){
            return res.json({success:false,message:"Unauthorized access"})
        }
        req.user = decodedToken
        next()
    }catch(err){
        res.json({success:false,message:"Invalid token, please login again"})
    }
}

export default auth