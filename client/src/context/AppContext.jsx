import { useContext } from "react";
import { createContext } from "react";
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";

axios.defaults.baseURL=import.meta.env.VITE_BASE_URL
axios.defaults.withCredentials = true

const setAuthHeader = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete axios.defaults.headers.common['Authorization']
    }
}

const AppContext=createContext()

export const AppProvider=({children})=>{
    const navigate=useNavigate()
    const [token,setToken]=useState(false)
    const [blogs,setBlogs]=useState([])
    const [input,setInput]=useState("")

    const fetchBlogs=async()=>{
        try{
            const {data}=await axios.get('/api/blog/all')
            data.success ? setBlogs(data.blogs): toast.error(data.message)
        }catch(error){
            toast.error(error.message)
        }
    }
    useEffect(()=>{
        fetchBlogs()
        const restoreSession = async () => {
            try {
                const { data } = await axios.get('/api/admin/me')
                setToken(Boolean(data?.success))
            } catch {
                setToken(false)
            }
        }
        restoreSession()
    },[])
    const value={
        axios,navigate,token,setToken,blogs,setBlogs,input,setInput,setAuthHeader
    }
    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext=()=>{
    return useContext(AppContext)
}