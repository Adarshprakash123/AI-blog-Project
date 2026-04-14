import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '../configs/db.js';
import { cacheKeys, deleteCacheKeys, getCachedJson, setCachedJson } from '../utils/cache.js';
import { serializeBlog, serializeComment } from '../utils/serializers.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const authCookieName = "accessToken";
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const createToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const setAuthCookie = (res, token) => {
  res.cookie(authCookieName, token, getCookieOptions());
};

const validateSignupInput = ({ name, email, password }) => {
  if (!name?.trim()) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (!email?.trim()) return "Email is required";
  if (!emailRegex.test(email.trim())) return "Enter a valid email address";
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include both letters and numbers";
  }
  return null;
};

export const adminsignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const validationError = validateSignupInput({ name, email, password });
    if (validationError) {
      return res.json({ success: false, message: validationError });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.json({ success: false, message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: "admin",
      },
    });

    const token = createToken(user);
    setAuthCookie(res, token);
    return res.json({
      success: true,
      message: "Signup successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const adminlogin=async(req,res)=>{
    try{
      const {email,password}=req.body;
      if(!email?.trim() || !password){
        return res.json({success:false,message:"Email and password are required"})
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return res.json({success:false,message:"No account found for this email"})
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.json({success:false,message:"Incorrect password"})
      }

      const token = createToken(user)
      setAuthCookie(res, token);
      res.json({
        success:true,
        message:"Login successful",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      })
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const getCurrentAdmin = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie(authCookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getAllBlogsAdmin=async(req,res)=>{
    try{
        const cachedBlogs = await getCachedJson(cacheKeys.adminBlogs);

        if (cachedBlogs) {
            return res.json({success:true,blogs: cachedBlogs, cached: true})
        }

        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' }
        })
        const serializedBlogs = blogs.map(serializeBlog)
        await setCachedJson(cacheKeys.adminBlogs, serializedBlogs, 180)
        res.json({success:true,blogs: serializedBlogs})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const getAllComments=async(req,res)=>{
    try{
        const cachedComments = await getCachedJson(cacheKeys.adminComments);

        if (cachedComments) {
            return res.json({success:true,comments: cachedComments, cached: true})
        }

        const comments = await prisma.comment.findMany({
            include: { blog: true },
            orderBy: { createdAt: 'desc' }
        })
        const serializedComments = comments.map(serializeComment)
        await setCachedJson(cacheKeys.adminComments, serializedComments, 180)
        res.json({success:true,comments: serializedComments})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const getDashboard=async(req,res)=>{
    try{
      const cachedDashboard = await getCachedJson(cacheKeys.dashboard);

      if (cachedDashboard) {
        return res.json({success:true,dashboardData: cachedDashboard, cached: true})
      }

      const recentBlogs = await prisma.blog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      const blogs = await prisma.blog.count();
      const comments = await prisma.comment.count();
      const drafts = await prisma.blog.count({ where: { isPublished: false } })
      const dashboardData={
        blogs,comments,drafts,recentBlogs: recentBlogs.map(serializeBlog)
      }
      await setCachedJson(cacheKeys.dashboard, dashboardData, 180)
      res.json({success:true,dashboardData})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const deleteCommentById=async(req,res)=>{
    try{
        const {id}=req.body;
        const deletedComment = await prisma.comment.delete({
            where: { id }
        });
        await deleteCacheKeys([
            cacheKeys.adminComments,
            cacheKeys.dashboard,
            ...(deletedComment?.blogId ? [cacheKeys.comments(deletedComment.blogId)] : []),
        ])
        res.json({success:true,message:"Deleted successfully"})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const approveCommentById=async(req,res)=>{
    try{
        const {id}=req.body;
        const updatedComment = await prisma.comment.update({
            where: { id },
            data: { isApproved: true }
        });
        await deleteCacheKeys([
            cacheKeys.adminComments,
            cacheKeys.dashboard,
            ...(updatedComment?.blogId ? [cacheKeys.comments(updatedComment.blogId)] : []),
        ])
        res.json({success:true,message:"Comment approved successfully"})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}
