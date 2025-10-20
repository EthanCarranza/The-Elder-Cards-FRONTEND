import React from "react";
interface MessageProps {
  message: string;
  type: "error" | "success";
}
const Message: React.FC<MessageProps> = ({ message, type }) => {
  if (!message) return null;
  return (
    <div
      className={`text-center my-2 px-4 py-2 rounded font-semibold ${
        type === "error"
          ? "bg-red-100 text-red-700 border border-red-400"
          : "bg-green-100 text-green-700 border border-green-400"
      }`}
    >
      {message}
    </div>
  );
};
export default Message;
