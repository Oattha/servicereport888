import { useState } from "react";

export default function PasswordInput({
  className = "",
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
  autoFocus = false,
  name,
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        className={`${className} pr-12`}
        type={isVisible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="absolute inset-y-0 right-3 flex items-center text-lg text-slate-500 transition hover:text-slate-800"
        aria-label={isVisible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        title={isVisible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
      >
        {isVisible ? "🙈" : "👁️"}
      </button>
    </div>
  );
}
