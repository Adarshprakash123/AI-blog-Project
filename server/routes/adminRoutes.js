import express from 'express'
import { adminlogin, adminLogout, adminsignup, approveCommentById, deleteCommentById, getAllBlogsAdmin, getAllComments, getCurrentAdmin, getDashboard } from '../controllers/adminControllers.js'
import auth from '../middleware/auth.js'
import { authLimiter } from '../middleware/security.js'

const adminRouter=express.Router()

adminRouter.post("/login",authLimiter,adminlogin)
adminRouter.post("/signup",authLimiter,adminsignup)
adminRouter.post("/logout",adminLogout)
adminRouter.get("/me",auth,getCurrentAdmin)
adminRouter.get("/comments",auth ,getAllComments)
adminRouter.get("/blogs",auth,getAllBlogsAdmin)
adminRouter.post("/delete-comment",auth,deleteCommentById)
adminRouter.post("/approve-comment",auth, approveCommentById)
adminRouter.get("/dashboard",auth,getDashboard)

export default adminRouter