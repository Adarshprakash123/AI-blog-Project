import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";
import Moment from "moment";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { parse } from "marked";

const Blog = () => {
  const { id } = useParams();

  const {axios}=useAppContext()
  const [data, setData] = useState(null);
  const hasHtmlTag = (text = "") => /<[^>]+>/.test(text);
  const sanitizeContentHtml = (html = "") => html.replace(/\sstyle="[^"]*"/gi, "");
  const stripMarkdownCodeFence = (text = "") =>
    text.replace(/^```(?:markdown|md|html)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const renderedDescription = hasHtmlTag(data?.description || "")
    ? stripMarkdownCodeFence(data?.description || "")
    : parse(stripMarkdownCodeFence(data?.description || ""));
  const safeDescription = sanitizeContentHtml(renderedDescription);

  const fetchBlogData = async () => {
    try{
      const {data}=await axios.get(`/api/blog/${id}`)
      data.success ? setData(data.blog) : toast.error(data.message)
    }catch(error){
      toast.error(error.message)
    }
  };
  useEffect(() => {
    fetchBlogData();
  }, []);
  return data ? (
    <div className="relative">
      <img
        src={assets.gradientBackground}
        alt=""
        className="absolute -top-50 -z-1 opacity-50"
      />
      <Navbar />
      <div className="text-center mt-20 text-gray-600">
        <p className="text-primary py-4 font-medium">
          Published on {Moment(data.createdAt).format("MMMM Do YYYY")}
        </p>
        <h1 className="text-2xl sm:text-5xl font-semibold max-w-2xl mx-auto text-gray-800">
          {data.title}
        </h1>
        <h2 className="my-5 max-w-lg truncate mx-auto">{data.subtitle}</h2>
        <p className="inline-block py-1 px-4 rounded-full mb-6 border text-sm border-primary/35 bg-primary/5 font-medium text-primary">
          Michael Dore
        </p>
      </div>
      <div className="mx-5 max-w-5xl md:mx-auto my-10 mt-6">
        <img src={data.image} alt="" className="rounded-3xl mb-5" />
        <div
          className="rich-text max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: safeDescription }}
        ></div>
        <div className="my-24 max-w-3xl mx-auto">
          <p className="font-semibold my-4">
            Share this article on Social Media
          </p>
          <div className="flex">
            <img src={assets.facebook_icon} width={50} alt="" />
            <img src={assets.twitter_icon} width={50} alt="" />
            <img src={assets.googleplus_icon} width={50} alt="" />
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  ) : (
    <div><Loader/></div>
  );
};

export default Blog;
