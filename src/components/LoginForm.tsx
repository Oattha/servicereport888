import { FormEvent, useState } from "react";
import { LogIn, Lock, User, Eye, EyeOff } from "lucide-react";
import { FormInput } from "./FormInput";

type LoginFormProps = {
  onLogin: () => void;
};

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>ยินดีต้อนรับเข้าสู่ระบบ</h2>
        <p>กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
      </div>

      <FormInput
        id="username"
        label="ชื่อผู้ใช้งาน (Username)"
        icon={User}
        value={username}
        onChange={setUsername}
        autoComplete="username"
      />

      <FormInput
        id="password"
        label="รหัสผ่าน (Password)"
        icon={Lock}
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        action={{
          label: showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน",
          icon: showPassword ? EyeOff : Eye,
          onClick: () => setShowPassword((current) => !current)
        }}
      />

      <label className="remember-row">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
        <span>จดจำการเข้าสู่ระบบ</span>
      </label>

      <button className="login-button" type="submit">
        <LogIn size={22} strokeWidth={2.4} aria-hidden="true" />
        <span>เข้าสู่ระบบ</span>
      </button>
    </form>
  );
}
