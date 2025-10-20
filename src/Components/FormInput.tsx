import React from "react";
interface FormInputProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ReactNode;
  autoComplete?: string;
}
const FormInput: React.FC<FormInputProps> = ({ id, type, value, onChange, placeholder, icon, autoComplete }) => (
  <div className="flex items-center border-b border-gray-400 py-2 mb-4 bg-white rounded-md px-2">
    {icon && <span className="text-gray-500 mr-2">{icon}</span>}
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
    />
  </div>
);
export default FormInput;
