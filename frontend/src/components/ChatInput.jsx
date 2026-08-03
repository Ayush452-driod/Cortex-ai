import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  MicOff,
  Paperclip,
  Presentation,
  Send,
  X,
  Zap,
} from "lucide-react";
import React, { useRef, useState,useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../features/sendMessage.js";
import {
  addMessages,
  setArtifacts,
  setIsLoading,
} from "../redux/messageSlice.js";
import { createConversation } from "../features/createConversation.js";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversationSlice.js";
import { updateConversation } from "../features/updateConversation.js";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const [selectedFile, setSelectedFile] = useState(null);
  const [listening,setListening] = useState(false);
  const recognitionRef = useRef(null);

  const { selectedConversation } = useSelector(
    (state) => state.conversation
  );

  const { isLoading } = useSelector((state) => state.message);

  const dispatch = useDispatch();
  const fileRef = useRef(null);

  useEffect(()=>{
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if(!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult= (event)=>{
      let transcript = ""
      for(let index = event.resultIndex ; index < event.results.length ; index++){
        transcript += event.results[index][0].transcript
      }
      setValue(transcript)
    }
    recognition.oneend = ()=>{
      setListening(false);
    }

    recognitionRef.currrent = recognition
  },[])

  const toggleMic = ()=>{
    if(!recognitionRef.current){
      alert("Speech recognition not supported")
    }
    if(listening){
      recognitionRef.current.stop()
      setListening(false);
    }else{
      recognitionRef.current.start()
      setListening(true);
    }
  }


  const handleSendMessage = async () => {
    if (isLoading) return;

    if (!value.trim() && !selectedFile) return;

    try {
      dispatch(setIsLoading(true));

      let conversation = selectedConversation;

      if (!conversation) {
        const conv = await createConversation();
        dispatch(setSelectedConversation(conv));
        dispatch(addConversation(conv));
        conversation = conv;
      }

      const title = value.trim().slice(0, 40);

      if (conversation?.title === "New Chat" && value.trim()) {
        await updateConversation({
          id: conversation?._id,
          title,
        });

        dispatch(
          setConvTitle({
            conversationId: conversation?._id,
            title,
          })
        );
      }

      const formData = new FormData();
      formData.append("prompt", value.trim());
      formData.append("conversationId", conversation?._id);
      formData.append("agent", selectedAgent.toLowerCase());

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      dispatch(
        addMessages({
          role: "user",
          content: value.trim(),
        })
      );

      setValue("");

      const data = await sendMessage(formData);

      dispatch(setArtifacts(data?.artifacts || []));

      dispatch(
        addMessages({
          role: "assistant",
          content: data?.answer,
          images: data?.images,
        })
      );

      setSelectedFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (error) {
      console.error(error);

      dispatch(
        addMessages({
          role: "assistant",
          content: "Something went wrong. Please try again.",
        })
      );
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },
    {
      id: "image",
      icon: ImageIcon,
      label: "Image",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]">
      <div className="flex flex-col gap-2 bg-white/3 border border-white/7 rounded-2xl px-4 pt-3.5 pb-3">
        <div className="flex w-[80%] gap-2 flex-wrap">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;

            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.label)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer
                  ${
                    isActive
                      ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                      : "bg-white/3 text-slate-400 border-white/6 hover:bg-white/7"
                  }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />
                {agent.label}
              </div>
            );
          })}
        </div>

        {selectedFile && (
          <div className="my-3">
            <div className="inline-flex items-center gap-2 rounded-xl border-white/10 bg-white/4 px-3 py-2">
              {selectedFile.type === "application/pdf" ? (
                <FileText size={16} className="text-red-400" />
              ) : (
                selectedFile.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="preview"
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                )
              )}

              <div>
                <p className="text-xs text-white">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <button
                className="ml-2"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileRef.current) {
                    fileRef.current.value = "";
                  }
                }}
              >
                <X size={14} className="text-slate-500 hover:text-white" />
              </button>
            </div>
          </div>
        )}

        <textarea
          placeholder="Ask Anything..."
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200
          placeholder:text-slate-600 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              hidden
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => {
                const file = e.target.files[0];

                if (!file) return;

                if (
                  file.type !== "application/pdf" &&
                  !file.type.startsWith("image/")
                ) {
                  alert("Only PDF and image files are allowed.");
                  return;
                }

                setSelectedFile(file);
              }}
            />

            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-shadow-slate-400 hover:bg-white/5
              border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent cursor-pointer"
              onClick={() => fileRef.current.click()}
            >
              <Paperclip size={16} />
            </button>

            <button
              onClick={toggleMic}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150  cursor-pointer
              ${listening ? "bg-red-500 text-white" : "text-slate-600 hover:bg-white/5"}`}
            >
              {listening ? <Mic size={16}/> : <MicOff size={16}/> }
            
            </button>
          </div>

          <button
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none transition-all duration-150
            ${
              value.trim() || selectedFile
                ? "bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white cursor-pointer"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
            disabled={(!value.trim() && !selectedFile) || isLoading}
            onClick={handleSendMessage}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;