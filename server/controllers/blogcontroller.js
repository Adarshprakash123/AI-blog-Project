// 



import fs from 'fs';
import imagekit from '../configs/imagekit.js';
import { prisma } from '../configs/db.js';
import { generateBlogContent } from '../configs/openai.js';
import { cacheKeys, deleteCacheKeys, getCachedJson, setCachedJson } from '../utils/cache.js';
import { serializeBlog, serializeComment } from '../utils/serializers.js';

export const addBlog = async (req, res) => {
  let imageFile;

  try {
    const { title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog);
    imageFile = req.file;

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

    const createdBlog = await prisma.blog.create({
      data: {
        title,
        subTitle,
        description,
        category,
        image: optimizedImageUrl,
        isPublished: Boolean(isPublished)
      }
    });

    await deleteCacheKeys([
      cacheKeys.blogs,
      cacheKeys.adminBlogs,
      cacheKeys.dashboard,
      cacheKeys.blogById(createdBlog.id),
    ]);

    res.json({ success: true, message: "Blog added successfully" });
  } catch (error) {
    console.error(error);
    const message = error?.message?.includes("cannot be authenticated")
      ? "Image upload auth failed. Set valid IMAGEKIT keys in server/.env and restart server."
      : (error.message || "Server error");
    res.json({ success: false, message });
  } finally {
    if (imageFile?.path && fs.existsSync(imageFile.path)) {
      fs.unlinkSync(imageFile.path);
    }
  }
};

export const getAllBlogs=async(req,res)=>{
    try{
        const cachedBlogs = await getCachedJson(cacheKeys.blogs);

        if (cachedBlogs) {
            return res.json({success:true, blogs: cachedBlogs, cached: true})
        }

        const blogs = await prisma.blog.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' }
        })
        const serializedBlogs = blogs.map(serializeBlog)
        await setCachedJson(cacheKeys.blogs, serializedBlogs, 300)
        res.json({success:true, blogs: serializedBlogs})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const getBlogById=async(req,res)=>{
    try{
        const{blogId}=req.params
        const cachedBlog = await getCachedJson(cacheKeys.blogById(blogId));
        if (cachedBlog) {
            return res.json({success:true,blog: cachedBlog, cached: true})
        }
        const blog=await prisma.blog.findUnique({ where: { id: blogId } })
        if(!blog){
            return res.json({success:false,message:"blog not found"})
        }
        const serializedBlog = serializeBlog(blog)
        await setCachedJson(cacheKeys.blogById(blogId), serializedBlog, 300)
        res.json({success:true,blog: serializedBlog})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const deleteBlogById=async(req,res)=>{
    try{
        const{id}=req.body
         await prisma.blog.delete({ where: { id } })
         await deleteCacheKeys([
            cacheKeys.blogs,
            cacheKeys.adminBlogs,
            cacheKeys.adminComments,
            cacheKeys.dashboard,
            cacheKeys.blogById(id),
            cacheKeys.comments(id),
         ])
        res.json({success:true,message:"Blog deleted Successfully"})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const togglePublish=async(req,res)=>{
    try{
        const {id}=req.body;
        const blog=await prisma.blog.findUnique({ where: { id } });
        if(!blog){
            return res.json({success:false,message:"Blog not found"})
        }
        const updatedBlog = await prisma.blog.update({
            where: { id },
            data: { isPublished: !blog.isPublished }
        })
        await deleteCacheKeys([
            cacheKeys.blogs,
            cacheKeys.adminBlogs,
            cacheKeys.dashboard,
            cacheKeys.blogById(id),
        ])
        res.json({
          success:true,
          message:"Blog status updated successfully",
          blog: serializeBlog(updatedBlog)
        })
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const addComment=async(req,res)=>{
    try{
        const {blog,name,content}=req.body
        await prisma.comment.create({
            data: {
                blogId: blog,
                name,
                content
            }
        })
        await deleteCacheKeys([
            cacheKeys.adminComments,
            cacheKeys.dashboard,
            cacheKeys.comments(blog),
        ])
        res.json({success:true,message:"successfully"})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const getBlogComments=async(req,res)=>{
    try{
        const {blogId}=req.body;
        const cachedComments = await getCachedJson(cacheKeys.comments(blogId));

        if (cachedComments) {
            return res.json({success:true,comments: cachedComments, cached: true})
        }

        const comments = await prisma.comment.findMany({
            where: { blogId, isApproved: true },
            orderBy: { createdAt: 'desc' }
        })
        const serializedComments = comments.map(serializeComment)
        await setCachedJson(cacheKeys.comments(blogId), serializedComments, 300)
        res.json({success:true,comments: serializedComments})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export const generateContent=async(req,res)=>{
    try{
        const {prompt}=req.body;
        if(!prompt?.trim()){
            return res.json({success:false,message:"Prompt is required"})
        }

        const content=await generateBlogContent(prompt.trim())
        res.json({success:true,content})
    }catch(error){
       res.json({success:false,message:error.message})
    }
}
