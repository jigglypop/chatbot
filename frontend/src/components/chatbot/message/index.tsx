import "./style.css";
import type { IMessage } from "./type";

const Message = ({ message }: IMessage) => {
  const { content, type } = message;
  const isAi = type === "ai";

  return (
    <div className={`message ${isAi ? "ai" : "human"}`}>
      <div className="message-avatar">{isAi ? "AI" : "나"}</div>
      <div className="message-content">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Message;
