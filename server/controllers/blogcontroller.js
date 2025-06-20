// 



import fs from 'fs';
import imagekit from '../configs/imagekit.js';
import Blog from '../models/blog.js';
import Comment from '../models/comments.js';
import main from '../configs/gemini.js';

export const addBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog);
    const imageFile = req.file;

    if (!title || !subTitle || !description || !category) {
      return res.json({ success: false, message: "Invalid blog data" });
    }

    if (!imageFile) {
      return res.json({ success: false, message: "Image file missing" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs"
    });

    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: 'auto' },
        { format: 'webp' },
        { width: '1280' }
      ]
    });

    await Blog.create({
      title,
      subTitle,
      description,
      category,
      image: optimizedImageUrl,
      isPublished
    });

    res.json({ success: true, message: "Blog added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
};

export const getAllBlogs=async(req,res)=>{
    try{
        const blogs=await Blog.find({isPublished:true})
        res.json({success:true, blogs})
    }catch(error){
        res.json({sucess:false,message:error.message})
    }
}

export const getBlogById=async(req,res)=>{
    try{
        const{blogId}=req.params
        const blog=await Blog.findById(blogId)
        if(!blog){
            return res.json({success:false,message:"blog not found"})
        }
        res.json({success:true,blog})
    }catch(error){
        res.json({success:false,message:"invalid bhai"})
    }
}

export const deleteBlogById=async(req,res)=>{
    try{
        const{id}=req.body
         await Blog.findByIdAndDelete(id)
         // Delete all Comments assosciated with the blog
         await Comment.deleteMany({blog:id})
        res.json({success:true,message:"Blog deleted Successfully"})
    }catch(error){
        res.json({success:false,message:"invalid bhai"})
    }
}

export const togglePublish=async(req,res)=>{
    try{
        const {id}=req.body;
        const blog=await Blog.findById(id);
        if(!blog){
            return res.json({message:"blog not found"})
        }
        blog.isPublished=!blog.isPublished
        await blog.save()
        res.json({success:true,message:"blog status updated Successfully"})
    }catch(error){
        res.json({success:false,message:"invalid bhai toggle"})
    }
}

export const addComment=async(req,res)=>{
    try{
        const {blog,name,content}=req.body
        await Comment.create({blog,name,content})
        res.json({success:true,message:"successfully"})
    }catch(error){
        res.json({success:false,message:"invalid bhai toggle"})
    }
}

export const getBlogComments=async(req,res)=>{
    try{
        const {blogId}=req.body;
        const comments=await Comment.find({blog:blogId,isApproved:true}).sort({createdAt:-1})
        res.json({success:true,comments})
    }catch(error){
        res.json({success:false,message:"invalid bhai toggle"})
    }
}

export const generateContent=async(req,res)=>{
    try{
        const {prompt}=req.body;
        const content=await main(prompt+' Generate a blog content for this topic in simple text format')
        res.json({success:true,content})
    }catch(error){
       res.json({success:false,message:error.message})
    }
}
