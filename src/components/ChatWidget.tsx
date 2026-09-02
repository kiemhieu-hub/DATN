import { Component, useCallback, useEffect, useRef, useState, type ChangeEvent, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getChatConversations, getChatMessages, sendChatMessage, type ChatConversation, type ChatMessage, type ChatRequestType } from "../services/chat.service";
import type { UserRole } from "../types/Auth";
import "./ChatWidget.css";

const labels:Record<ChatRequestType,string>={GENERAL:"Tin nhắn thường",RESCHEDULE:"Yêu cầu đổi lịch",CANCEL_REFUND:"Yêu cầu hủy/hoàn tiền",CHANGE_SCHEDULE:"Yêu cầu đổi lịch làm việc",LEAVE_REQUEST:"Yêu cầu nghỉ"};
const unchanged=(a:ChatMessage[],b:ChatMessage[])=>a.length===b.length&&a.every((item,index)=>item._id===b[index]?._id);
const safeMessages=(values:ChatMessage[])=>values.filter(item=>Boolean(item?._id)).map(item=>({
  ...item,
  text:typeof item.text==="string"?item.text:"",
  imageData:typeof item.imageData==="string"?item.imageData:"",
  requestType:item.requestType in labels?item.requestType:"GENERAL" as const,
  sender:item.sender&&typeof item.sender==="object"?item.sender:{_id:"",fullName:"Người dùng",role:item.senderRole},
  createdAt:item.createdAt||new Date().toISOString(),
}));

function ChatWidgetContent(){
  const path=useLocation().pathname;
  const role:UserRole=path.startsWith("/receptionist")?"RECEPTIONIST":path.startsWith("/barber")?"BARBER":"CLIENT";
  const {user,isAuthenticated}=useAuth(role);
  const receptionist=role==="RECEPTIONIST";
  const [open,setOpenState]=useState(()=>sessionStorage.getItem("thadsChatOpen")==="true");
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [conversations,setConversations]=useState<ChatConversation[]>([]);
  const [selected,setSelected]=useState<ChatConversation|null>(null);
  const [text,setText]=useState("");const [image,setImage]=useState("");
  const [kind,setKind]=useState<ChatRequestType>("GENERAL");
  const [error,setError]=useState("");const [sending,setSending]=useState(false);
  const selectedRef=useRef<ChatConversation|null>(null);
  const messagesRef=useRef<ChatMessage[]>([]);
  const messageListRef=useRef<HTMLDivElement>(null);
  const options:ChatRequestType[]=role==="CLIENT"?["GENERAL","RESCHEDULE","CANCEL_REFUND"]:role==="BARBER"?["GENERAL","CHANGE_SCHEDULE","LEAVE_REQUEST"]:["GENERAL"];
  const setOpen=(value:boolean|((current:boolean)=>boolean))=>setOpenState(current=>{const next=typeof value==="function"?value(current):value;sessionStorage.setItem("thadsChatOpen",String(next));return next});

  useEffect(()=>{selectedRef.current=selected},[selected]);
  useEffect(()=>{messagesRef.current=messages},[messages]);
  const applyMessages=useCallback((values:ChatMessage[])=>{const next=safeMessages(values);if(!unchanged(messagesRef.current,next)){messagesRef.current=next;setMessages(next)}},[]);

  const load=useCallback(async()=>{
    if(!open||!isAuthenticated)return;
    try{
      if(receptionist){
        const response=await getChatConversations();const validConversations=(response.items||[]).filter(item=>Boolean(item?.user?._id));setConversations(validConversations);
        const current=selectedRef.current;
        const target=current?.user?._id?(validConversations.find(item=>item.user._id===current.user._id)??current):(validConversations[0]??null);
        if(!current&&target){selectedRef.current=target;setSelected(target)}
        if(target)applyMessages((await getChatMessages(target.user._id)).items);else applyMessages([]);
      }else applyMessages((await getChatMessages()).items);
      setError("");
    }catch{setError("Mất kết nối chat. Hệ thống sẽ tự thử lại.")}
  },[open,isAuthenticated,receptionist,applyMessages]);

  useEffect(()=>{
    if(!open||!isAuthenticated)return;
    let stopped=false;let timer:number|undefined;
    const poll=async()=>{await load();if(!stopped)timer=window.setTimeout(()=>void poll(),5000)};
    void poll();return()=>{stopped=true;if(timer)window.clearTimeout(timer)};
  },[open,isAuthenticated,load]);
  useEffect(()=>{
    const list=messageListRef.current;
    if(!list)return;
    list.scrollTop=list.scrollHeight;
  },[messages]);
  if(!isAuthenticated||!user)return null;

  const choose=async(item:ChatConversation)=>{try{selectedRef.current=item;setSelected(item);setError("");applyMessages((await getChatMessages(item.user._id)).items)}catch{setError("Không thể mở hội thoại này")}};
  const chooseImage=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;if(file.size>10_000_000){setError("Ảnh tối đa 10 MB");event.target.value="";return}const reader=new FileReader();reader.onload=()=>setImage(String(reader.result));reader.onerror=()=>setError("Không thể đọc ảnh");reader.readAsDataURL(file)};
  const send=async()=>{
    if((!text.trim()&&!image)||sending)return;
    const previous=messagesRef.current;
    const optimistic:ChatMessage={_id:`local-${Date.now()}`,owner:selectedRef.current?.user._id||user.id,sender:{_id:user.id,fullName:user.fullName,role},senderRole:role,text:text.trim(),imageData:image,requestType:kind,createdAt:new Date().toISOString()};
    try{
      setSending(true);setError("");applyMessages([...previous,optimistic]);
      const outgoing={recipientId:selectedRef.current?.user._id,text,imageData:image,requestType:kind};
      setText("");setImage("");setKind("GENERAL");
      await sendChatMessage(outgoing);
    }catch{applyMessages(previous);setError("Không thể gửi tin nhắn");}finally{setSending(false)}
  };

  return <><button className="chat-floating-button" onClick={()=>setOpen(value=>!value)} aria-label="Mở chat">{open?"×":"✉"}</button>{open&&<section className={`chat-window ${receptionist?"receptionist":""}`}>
    {receptionist&&<aside className="chat-conversations"><h3>Hội thoại</h3>{conversations.length===0?<p>Chưa có tin nhắn</p>:conversations.filter(item=>Boolean(item?.user?._id)).map(item=><button className={selected?.user?._id===item.user._id?"active":""} key={item.user._id} onClick={()=>void choose(item)}><b>{item.user.fullName||"Người dùng"}</b><span>{item.user.role==="BARBER"?"Barber":"Khách hàng"} · {item.lastMessage||"Đã gửi ảnh"}</span>{item.unread>0&&<i>{item.unread}</i>}</button>)}</aside>}
    <div className="chat-main"><header><div><small>THADS BARBER</small><h3>{receptionist?(selected?.user.fullName||"Chọn hội thoại"):"Chat với lễ tân"}</h3></div><button onClick={()=>setOpen(false)}>×</button></header>{error&&<p className="chat-error">{error}</p>}
    <div className="chat-messages" ref={messageListRef}>{messages.length===0?<p className="chat-empty">Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện.</p>:messages.map(message=><article className={message.senderRole===role?"mine":"theirs"} key={message._id}>{message.requestType!=="GENERAL"&&<span>{labels[message.requestType]}</span>}{message.text&&<p>{message.text}</p>}{message.imageData&&<img src={message.imageData} alt="Ảnh trong hội thoại"/>}<small>{message.sender?.fullName||"Người dùng"} · {new Date(message.createdAt).toLocaleString("vi-VN")}</small></article>)}</div>
    {(!receptionist||selected)&&<footer><select value={kind} onChange={event=>setKind(event.target.value as ChatRequestType)}>{options.map(value=><option key={value} value={value}>{labels[value]}</option>)}</select>{image&&<div className="chat-image-preview"><img src={image} alt="Ảnh chuẩn bị gửi"/><button onClick={()=>setImage("")}>×</button></div>}<div><label title="Gửi ảnh">＋<input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseImage}/></label><textarea rows={2} value={text} onChange={event=>setText(event.target.value)} placeholder="Nhập tin nhắn..." onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();void send()}}}/><button disabled={sending} onClick={()=>void send()}>{sending?"…":"Gửi"}</button></div></footer>}</div>
  </section>}</>;
}

class ChatErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return{failed:true}}
  componentDidCatch(error:Error,info:ErrorInfo){console.error("ChatWidget error:",error,info)}
  render(){
    if(this.state.failed)return <section className="chat-window chat-recovery"><div><b>Không thể hiển thị chat</b><span>Trang chính vẫn hoạt động bình thường.</span><button onClick={()=>this.setState({failed:false})}>Mở lại chat</button></div></section>;
    return this.props.children;
  }
}

export default function ChatWidget(){
  return <ChatErrorBoundary><ChatWidgetContent/></ChatErrorBoundary>;
}
