import { FormEvent, useState } from "react";
import { Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import { login } from "../lib/api";
import { FormInput } from "./FormInput";

type LoginFormProps = {
  onLogin: (remember: boolean) => void;
};

const rememberedEmailKey = "service-report-remembered-email";

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState(() => localStorage.getItem(rememberedEmailKey) ?? "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => localStorage.getItem(rememberedEmailKey) !== null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      if (remember) {
        localStorage.setItem(rememberedEmailKey, email.trim());
      } else {
        localStorage.removeItem(rememberedEmailKey);
      }
      onLogin(remember);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>ยินดีต้อนรับเข้าสู่ระบบ</h2>
        <p>กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
      </div>

      <FormInput
        id="email"
        label="อีเมล (Email)"
        icon={Mail}
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
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

      {error ? <p className="form-error">{error}</p> : null}

      <button className="login-button" type="submit" disabled={isSubmitting}>
        <LogIn size={22} strokeWidth={2.4} aria-hidden="true" />
        <span>{isSubmitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}</span>
      </button>
    </form>
  );
}
