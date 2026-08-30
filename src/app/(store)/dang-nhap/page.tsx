"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, Mail, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { STORE_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";

type AuthMode = "phone" | "email-login" | "email-signup" | "otp" | "forgot-password";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { signInWithPhone, verifyOtp, signInWithEmail, signUpWithEmail, resetPasswordForEmail } =
    useAuth();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }
    setLoading(true);
    const { error } = await signInWithPhone(phone);
    setLoading(false);

    if (error) {
      toast.error("Không thể gửi mã OTP. Vui lòng thử lại.");
      return;
    }
    toast.success("Đã gửi mã OTP đến " + phone);
    setMode("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await verifyOtp(phone, otp);
    setLoading(false);

    if (error) {
      toast.error("Mã OTP không đúng. Vui lòng thử lại.");
      return;
    }
    toast.success("Đăng nhập thành công!");
    router.push(redirect);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);

    if (error) {
      toast.error("Email hoặc mật khẩu không đúng.");
      return;
    }
    toast.success("Đăng nhập thành công!");
    router.push(redirect);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return;
    }
    setLoading(true);
    const { error } = await signUpWithEmail(email, password, fullName);
    setLoading(false);

    if (error) {
      toast.error("Không thể tạo tài khoản: " + error.message);
      return;
    }
    toast.success("Tạo tài khoản thành công! Vui lòng kiểm tra email.");
    setMode("email-login");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPasswordForEmail(email);
    setLoading(false);

    if (error) {
      toast.error("Không thể gửi email. Vui lòng thử lại.");
      return;
    }
    toast.success("Đã gửi link đặt lại mật khẩu tới email của bạn!");
    setMode("email-login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        {/* Demo Banner */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Chế độ Demo</strong> — Chưa kết nối Supabase
            </p>
            <Link href="/admin">
              <Button className="bg-green-600 hover:bg-green-700 w-full">
                Vào trang Quản trị (Demo)
              </Button>
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{STORE_NAME}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === "email-signup"
              ? "Tạo tài khoản mới"
              : "Đăng nhập để đặt hàng"}
          </p>
        </div>

        {/* Phone Login */}
        {mode === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  maxLength={11}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">hoặc</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setMode("email-login")}
            >
              <Mail className="w-4 h-4 mr-2" />
              Đăng nhập bằng Email
            </Button>
          </form>
        )}

        {/* OTP Verification */}
        {mode === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Nhập mã OTP đã gửi đến <strong>{phone}</strong>
            </p>
            <div>
              <Label htmlFor="otp">Mã OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-center text-2xl tracking-widest mt-1"
                maxLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "Xác nhận"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setMode("phone")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </form>
        )}

        {/* Email Login */}
        {mode === "email-login" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="text-green-600 hover:underline"
                onClick={() => setMode("phone")}
              >
                Đăng nhập bằng SĐT
              </button>
              <button
                type="button"
                className="text-green-600 hover:underline"
                onClick={() => setMode("email-signup")}
              >
                Tạo tài khoản
              </button>
            </div>
            <button
              type="button"
              className="w-full text-sm text-gray-500 hover:underline text-center"
              onClick={() => setMode("forgot-password")}
            >
              Quên mật khẩu?
            </button>
          </form>
        )}

        {/* Email Signup */}
        {mode === "email-signup" && (
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="signupEmail">Email</Label>
              <Input
                id="signupEmail"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="signupPassword">Mật khẩu</Label>
              <Input
                id="signupPassword"
                type="password"
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>

            <button
              type="button"
              className="w-full text-sm text-green-600 hover:underline"
              onClick={() => setMode("email-login")}
            >
              Đã có tài khoản? Đăng nhập
            </button>
          </form>
        )}

        {/* Forgot Password */}
        {mode === "forgot-password" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu
            </p>
            <div>
              <Label htmlFor="forgotEmail">Email</Label>
              <Input
                id="forgotEmail"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setMode("email-login")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
