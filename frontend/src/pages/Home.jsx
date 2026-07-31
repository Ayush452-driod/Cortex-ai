import React from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../utils/firebase.js'
import api from "../utils/axios.js";
import {FcGoogle} from 'react-icons/fc';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';
import SideBar from '../components/SideBar.jsx';
import ChatArea from '../components/ChatArea.jsx';
import Artifact from '../components/ArtiFact.jsx';

function Home() {
  const {userData} = useSelector(state=>state.user);
  const dispatch = useDispatch()
   const handleLogin = async (token)=>{
      try {
        const {data} = await api.post("/api/auth/login",{token});
        dispatch(setUserData(data))
      } catch (error) {
        console.log(error);
      }
  }


  const googleLogin = async()=>{
     try {
    const result = await signInWithPopup(auth, googleProvider);

    const token = await result.user.getIdToken();
    console.log(token);

    await handleLogin(token);
    } catch (error) {
    console.log("Code:", error.code);
    console.log("Message:", error.message);
    console.log("Full Error:", error);
   }
}
  return (
    <div className='h-screen flex bg-[#0d0f14] text-white overflow-hidden'>
      <SideBar/>
      <ChatArea/>
      <Artifact/>
      {!userData && 
           <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur'>
              <div className='w-85 bg-[#13151c] border border-white/8 rounded-2xl p-7 flex flex-col gap-5'>
                 <div className='flex felx-col gap-1'>
                   <h2 className='text-[17px] font-semibold text-slate-100 tracking-tight'>Welcome to CortexAI</h2>
                   <p className='text-[13px] text-slate-500'>Please login to continue using the app.</p>
                   </div>
                <button className='w-full flex items-center justify-center gap-3 py-2.75 rounded-xl test-sm font-medium
             text-black/90 bg-white hover:bg-gray-200 transition-all duration-150 cursor-pointer' onClick={googleLogin}>
                <FcGoogle size={15} />
                Continue With Google
            </button>
        </div>
      </div>
      }
     
    </div>
  )
}

export default Home
