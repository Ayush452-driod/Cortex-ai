import React, { useEffect, useState } from "react";

import {
  LogOut,
  MessageSquare,
  PanelLeftIcon,
  PenSquare,
  Plus,
  User,
  Coins,
  PanelRight,
  Menu,
  X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { getConversations } from "../features/getConversations.js";
import { createConversation } from "../features/createConversation.js";
import { logout } from "../features/logOut.js";

import {
  addConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/conversationSlice.js";

import {
  setMessages
} from "../redux/messageSlice.js";



import {
  setUserData
} from "../redux/userSlice.js";

import BillingDrawer from "./BillingDrawer.jsx";


const SideBar = () => {

  const dispatch = useDispatch();


  // ============================
  // Local State
  // ============================

  const [collapsed,setCollapsed] = useState(false);
  const [mobileOpen,setMobileOpen] = useState(false);
  const [imageError,setImageError] = useState(false);
  const [showBilling,setShowBilling] = useState(false);



  // ============================
  // Redux State
  // ============================

  const {
    conversations,
    selectedConversation
  } = useSelector(
    state => state.conversation
  );


  const {
    userData
  } = useSelector(
    state => state.user
  );



  // ============================
  // Fetch Conversations
  // ============================

  useEffect(()=>{


    const fetchConversations = async()=>{

      try{

        const data = await getConversations();


        dispatch(
          setConversations(data)
        );


        if(data.length === 0)
          return;



        const savedConversation =
          localStorage.getItem(
            "selectedConversation"
          );


        if(savedConversation){

          const parsed =
            JSON.parse(savedConversation);


          const existingConversation =
            data.find(
              conv =>
              conv._id === parsed._id
            );


          if(existingConversation){

            dispatch(
              setSelectedConversation(
                existingConversation
              )
            );

            return;
          }

        }



        dispatch(
          setSelectedConversation(
            data[0]
          )
        );


      }
      catch(error){

        console.error(
          "Conversation fetch error:",
          error
        );

      }

    };



    if(userData?._id){

      fetchConversations();

    }


  },[
    dispatch,
    userData?._id
  ]);





  // ============================
  // Mobile Scroll Lock
  // ============================

  useEffect(()=>{


    document.body.style.overflow =
      mobileOpen
      ? "hidden"
      : "auto";



    return()=>{

      document.body.style.overflow="auto";

    };


  },[
    mobileOpen
  ]);





  // ============================
  // Select Conversation
  // ============================


  const handleSelectConversation = (
    conversation
  )=>{


    dispatch(
      setSelectedConversation(
        conversation
      )
    );


    localStorage.setItem(
      "selectedConversation",
      JSON.stringify(conversation)
    );


    setMobileOpen(false);

  };





  // ============================
  // Create New Conversation
  // ============================


  const handleCreateConversation =
  async()=>{


    try{


      const data =
        await createConversation();



      dispatch(
        addConversation(data)
      );



      dispatch(
        setSelectedConversation(data)
      );



      localStorage.setItem(
        "selectedConversation",
        JSON.stringify(data)
      );



      setMobileOpen(false);


    }
    catch(error){

      console.error(
        "Create conversation error:",
        error
      );

    }


  };





  // ============================
  // New Empty Chat
  // ============================


  const handleNewChat = ()=>{


    dispatch(
      setSelectedConversation(null)
    );


    dispatch(
      setMessages([])
    );


    dispatch(
      setArtifacts([])
    );



    localStorage.removeItem(
      "selectedConversation"
    );



    setMobileOpen(false);

  };





  // ============================
  // Logout
  // ============================


  const handleLogout =
  async()=>{


    try{


      await logout();


      dispatch(
        setUserData(null)
      );


    }
    catch(error){

      console.error(
        error
      );

    }


  };





  // ============================
  // Collapsed Sidebar
  // ============================


  if(collapsed){

    return(

      <>
      
      <div className="
        hidden lg:flex
        flex-col
        items-center
        w-16
        h-screen
        bg-[#0d0f14]
        border-r
        border-white/10
        py-4
      ">


        <button
          onClick={()=>setCollapsed(false)}
          className="
          flex items-center justify-center
          w-10 h-10
          rounded-xl
          text-slate-500
          hover:text-white
          hover:bg-white/5
          "
        >
          <PanelRight size={18}/>
        </button>



        <button
          onClick={handleNewChat}
          className="
          mt-2
          flex items-center justify-center
          w-10 h-10
          rounded-xl
          text-slate-500
          hover:text-white
          hover:bg-white/5
          "
        >
          <Plus size={18}/>
        </button>



        <div className="
          flex-1
          w-full
          mt-5
          overflow-y-auto
          px-2
        ">


        {
          conversations.map(conv=>(

            <button
              key={conv._id}
              onClick={()=>handleSelectConversation(conv)}
              className="
              w-full
              h-11
              mb-2
              flex
              items-center
              justify-center
              rounded-xl
              hover:bg-white/5
              "
            >

              <MessageSquare size={16}/>

            </button>

          ))
        }


        </div>



      </div>


      <BillingDrawer
        open={showBilling}
        onClose={()=>setShowBilling(false)}
      />


      </>

    );

  }
    // ============================
  // Main Sidebar
  // ============================

  return (
    <>

      {/* Mobile Menu Button */}

      {!mobileOpen && (

        <button
          onClick={()=>setMobileOpen(true)}
          className="
          lg:hidden
          fixed
          top-4
          left-4
          z-50
          flex
          items-center
          justify-center
          w-10
          h-10
          rounded-xl
          bg-[#0d0f14]
          border
          border-white/10
          text-slate-400
          hover:text-white
          "
        >

          <Menu size={18}/>

        </button>

      )}




      {/* Overlay */}

      {
        mobileOpen && (

          <div
            onClick={()=>setMobileOpen(false)}
            className="
            lg:hidden
            fixed
            inset-0
            z-40
            bg-black/60
            backdrop-blur-sm
            "
          />

        )
      }






      {/* Sidebar */}

      <aside
        className={`
          fixed
          lg:static
          inset-y-0
          left-0
          z-50
          flex
          flex-col
          w-72
          h-screen
          bg-[#0d0f14]
          border-r
          border-white/10
          transition-transform
          duration-300
          
          ${
            mobileOpen
            ?
            "translate-x-0"
            :
            "-translate-x-full lg:translate-x-0"
          }

        `}
      >





        {/* Header */}

        <div
          className="
          flex
          items-center
          gap-3
          px-5
          py-4
          border-b
          border-white/10
          "
        >


          {/* Collapse */}

          <button
            onClick={()=>setCollapsed(true)}
            className="
            hidden
            lg:flex
            items-center
            justify-center
            w-8
            h-8
            rounded-lg
            text-slate-500
            hover:text-white
            hover:bg-white/5
            "
          >

            <PanelLeftIcon size={18}/>

          </button>





          {/* Mobile Close */}

          <button
            onClick={()=>setMobileOpen(false)}
            className="
            lg:hidden
            flex
            items-center
            justify-center
            w-8
            h-8
            rounded-lg
            text-slate-500
            "
          >

            <X size={18}/>

          </button>





          {/* Logo */}

          <div className="flex-1">

            <h1 className="
              text-white
              text-lg
              font-semibold
            ">

              CortexAI

            </h1>


          </div>






          {/* Plan */}

          <span
            className="
            text-[10px]
            px-2
            py-1
            rounded-full
            bg-indigo-500/10
            text-indigo-400
            border
            border-indigo-500/20
            uppercase
            "
          >

            {userData?.plan || "FREE"}

          </span>





          {/* New Chat */}

          <button
            onClick={handleNewChat}
            className="
            flex
            items-center
            justify-center
            w-8
            h-8
            rounded-lg
            text-slate-500
            hover:text-white
            hover:bg-white/5
            "
          >

            <PenSquare size={16}/>

          </button>


        </div>









        {/* Create Conversation Button */}

        <div className="p-4">


          <button
            onClick={handleCreateConversation}
            className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            py-3
            text-sm
            font-medium
            text-white
            bg-linear-to-r
            from-indigo-600
            to-violet-700
            hover:opacity-90
            "
          >

            <Plus size={16}/>

            New Chat

          </button>


        </div>









        {/* Title */}

        <div className="px-5 pb-2">


          {
            conversations.length === 0

            ?

            <p className="
            text-xs
            uppercase
            tracking-[0.2em]
            text-slate-600
            ">

              No Conversations

            </p>


            :

            <p className="
            text-xs
            uppercase
            tracking-[0.2em]
            text-slate-600
            ">

              Recent Chats

            </p>

          }


        </div>









        {/* Conversation List */}

        <div
          className="
          flex-1
          overflow-y-auto
          px-3
          pb-3
          "
        >


          {
            conversations.map(conv=>{


              const active =
                selectedConversation?._id === conv._id;



              return (

                <button

                  key={conv._id}

                  onClick={()=>
                    handleSelectConversation(conv)
                  }


                  className={`
                    w-full
                    mb-2
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    transition-all
                    
                    ${
                      active

                      ?

                      "bg-indigo-500/15 border border-indigo-500/20"

                      :

                      "hover:bg-white/5 border border-transparent"
                    }

                  `}

                >



                  <div
                    className={`
                    flex
                    items-center
                    justify-center
                    w-9
                    h-9
                    rounded-lg

                    ${
                      active

                      ?

                      "bg-indigo-500/20 text-indigo-400"

                      :

                      "bg-white/5 text-slate-500"

                    }

                    `}
                  >

                    <MessageSquare size={15}/>

                  </div>





                  <div className="
                    flex-1
                    text-left
                    overflow-hidden
                  ">


                    <p
                      className={`
                      text-sm
                      truncate

                      ${
                        active
                        ?
                        "text-white"
                        :
                        "text-slate-300"
                      }

                      `}
                    >

                      {conv.title || "New Chat"}

                    </p>


                  </div>



                </button>

              );


            })
          }


        </div>









        {/* Footer */}

        <div
          className="
          border-t
          border-white/10
          p-3
          "
        >



          {

          userData ? (

          <div
            className="
            flex
            items-center
            gap-3
            rounded-xl
            px-3
            py-2
            hover:bg-white/5
            "
          >



            {/* Avatar */}

            <div>


            {
              userData.avatar && !imageError

              ?

              <img

                src={userData.avatar}

                alt="Profile"

                onError={()=>
                  setImageError(true)
                }

                className="
                w-10
                h-10
                rounded-xl
                object-cover
                border
                border-indigo-500/30
                "

              />

              :

              <div
                className="
                w-10
                h-10
                rounded-xl
                bg-white/5
                flex
                items-center
                justify-center
                "
              >

                <User
                  size={18}
                  className="text-slate-400"
                />

              </div>

            }


            </div>





            {/* User */}

            <div className="
              flex-1
              min-w-0
            ">

              <p className="
                text-sm
                font-semibold
                text-white
                truncate
              ">

                {userData.name || "User"}

              </p>


              <p className="
                text-xs
                text-slate-500
              ">

                {userData.plan}

              </p>


            </div>






            {/* Billing */}

            <button
              onClick={()=>
                setShowBilling(true)
              }

              className="
              flex
              items-center
              justify-center
              w-9
              h-9
              rounded-lg
              text-yellow-500
              hover:bg-white/5
              "
            >

              <Coins size={18}/>

            </button>







            {/* Logout */}

            <button
              onClick={handleLogout}

              className="
              flex
              items-center
              justify-center
              w-9
              h-9
              rounded-lg
              text-slate-500
              hover:text-red-400
              hover:bg-white/5
              "
            >

              <LogOut size={18}/>

            </button>



          </div>


          )


          :

          (

          <button
            className="
            w-full
            rounded-xl
            bg-indigo-600
            py-2.5
            text-white
            "
          >

            Login

          </button>

          )


          }



        </div>





      </aside>





      {/* Billing Drawer */}

      <BillingDrawer

        open={showBilling}

        onClose={()=>
          setShowBilling(false)
        }

      />



    </>

  );


};


export default SideBar;