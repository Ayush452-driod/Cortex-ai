import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble.jsx'
import LoadingAnimation from './LoadingAnimation.jsx'

const MessageList = () => {

  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages , isLoading } = useSelector(state => state.message)
  const bottomRef = useRef(null)


  useEffect(()=>{
      requestAnimationFrame(()=>{
        bottomRef?.current.scrollIntoView({
          behavior : "smooth",
          block :"end"
        })
      })
  },[messages?.length,isLoading])

  return (
    <div className='flex-1 overflow-y-auto px-6 py-6 scrollbar-none [&::-webkit-scrollbar]:hidden h-full'>

      {messages.length === 0 || !selectedConversation ? (
        <div className='min-h-full flex flex-col items-center justify-center text-center'>
          
          <div className='flex flex-col items-center gap-1.5'>
            <h1 className='text-[20px] font-semibold text-slate-200 tracking-tight'>
              CortexAI
            </h1>

            <p className='text-[15px] font-semibold text-slate-200 tracking-tight'>
              How can I help you?
            </p>

            <p className='text-[13px] text-slate-600 max-w-65 leading-relaxed'>
              Ask me anything - code, ideas, explanations, or just a quick question.
            </p>
          </div>

          <div className='flex flex-wrap justify-center gap-2 mt-5'>
            {["Make a Netflix clone", "Explain Redis", "Build a dashboard"].map((s, i) => (
              <button
                key={i}
                className='text-[12px] text-slate-400 bg-white/4 border border-white/7 px-3 py-1.5 rounded-lg hover:bg-white/8 hover:text-slate-200 transition-colors duration-150 cursor-pointer'
              >
                {s}
              </button>
            ))}
          </div>

        </div>
      ) : (
        <div className='space-y-5'>
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg?.role}
              content={msg?.content}
              images = {msg.images || []}
            />
          ))}
          {isLoading &&  <LoadingAnimation/>}
        </div>
      )}
      <div  ref={bottomRef}/>
    </div>
  )
}

export default MessageList