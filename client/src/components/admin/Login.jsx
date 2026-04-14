import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const Login = () => {
  const {axios,setToken}=useAppContext();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail]=useState('')
  const [password, setPassword]=useState('')

  const validateForm = () => {
    if (isSignup && name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return false;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    if (isSignup && password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try{
      const endpoint = isSignup ? "/api/admin/signup" : "/api/admin/login";
      const payload = isSignup ? { name, email, password } : { email, password };
      const {data}=await axios.post(endpoint,payload)
      if(data.success){
        setToken(true)
        toast.success(data.message || (isSignup ? "Signup successful" : "Login successful"))
      }else{
        toast.error(data.message)
      }
    }catch(error){
      toast.error(error.message)
    }
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-sm p-6 max-md:m-6 border border-primary/30 shadow-xl shadow-primary/15 rounded-lg">
        <div className="flex flex-col items-center justify-between">
          <div className="w-full py-6 text-center">
            <h1 className="tex-3xl font-bold">
              {" "}
              <span className="text-primary">Admin </span>{isSignup ? "Signup" : "Login"}
            </h1>
            <p className="font-light">
              {isSignup
                ? "Create your admin account to access the dashboard"
                : "Enter your credentials to access the admin page"}
            </p>
          </div>
          <form
            onSubmit={handlesubmit}
            className="mt-6 w-full sm:max-w-md text-gray-600"
          >
            {isSignup && (
              <div className="flex flex-col">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  placeholder="your name"
                  className="border-b-2 border-gray-300 p-2 outline-none mb-6"
                />
              </div>
            )}
            <div className="flex flex-col">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="your email ID"
                className="border-b-2 border-gray-300 p-2 outline-none mb-6"
              />
            </div>

            <div className="flex flex-col">
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="your pasword"
                className="border-b-2 border-gray-300 p-2 outline-none mb-6"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 font-medium bg-primary text-white rounded cursor-pointer hover:bg-primary/90 transition-all"
            >
              {isSignup ? "Create Account" : "Login"}
            </button>
            <p className="text-sm mt-4 text-center">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                className="text-primary font-medium cursor-pointer"
                onClick={() => setIsSignup((prev) => !prev)}
              >
                {isSignup ? "Login" : "Signup"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
