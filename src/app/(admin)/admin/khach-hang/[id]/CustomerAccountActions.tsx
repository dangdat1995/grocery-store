"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import {
  KeyRound,
  Shield,
  ShieldCheck,
  Save,
  Loader2,
  UserCog,
  Pencil,
  Mail,
  Phone,
} from "lucide-react";

interface Props {
  customerId: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  role: string;
}

export default function CustomerAccountActions({
  customerId,
  fullName,
  phone,
  email,
  role: initialRole,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(fullName || "");
  const [phoneVal, setPhoneVal] = useState(phone || "");
  const [role, setRole] = useState(initialRole);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    if (isDemo) {
      toast.success("Demo: Đã cập nhật thông tin");
      setEditing(false);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name || null,
        phone: phoneVal || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    if (error) {
      toast.error("Lỗi: " + error.message);
    } else {
      toast.success("Đã cập nhật thông tin");
      setEditing(false);
      router.refresh();
    }
    setSaving(false);
  };

  const handleToggleRole = async () => {
    const newRole = role === "admin" ? "customer" : "admin";
    const label = newRole === "admin" ? "Quản trị viên" : "Khách hàng";

    if (!confirm(`Chuyển ${name || "người dùng này"} thành ${label}?`)) return;

    if (isDemo) {
      setRole(newRole);
      toast.success(`Demo: Đã chuyển quyền → ${label}`);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", customerId);

    if (error) {
      toast.error("Lỗi: " + error.message);
    } else {
      setRole(newRole);
      toast.success(`Đã chuyển quyền → ${label}`);
      router.refresh();
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Không có email để gửi đặt lại mật khẩu");
      return;
    }

    if (!confirm(`Gửi email đặt lại mật khẩu tới ${email}?`)) return;

    if (isDemo) {
      toast.success(`Demo: Đã gửi email đặt lại mật khẩu tới ${email}`);
      return;
    }

    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dat-lai-mat-khau`,
    });

    if (error) {
      toast.error("Lỗi: " + error.message);
    } else {
      toast.success(`Đã gửi email đặt lại mật khẩu tới ${email}`);
    }
    setResetting(false);
  };

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <UserCog className="w-4 h-4 text-indigo-600" /> Quản lý tài khoản
        </h3>
        <Badge
          className={`text-xs cursor-pointer ${
            role === "admin"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={handleToggleRole}
        >
          {role === "admin" ? (
            <><ShieldCheck className="w-3 h-3 mr-1" /> Admin</>
          ) : (
            <><Shield className="w-3 h-3 mr-1" /> Khách hàng</>
          )}
        </Badge>
      </div>

      {/* Info / Edit */}
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Họ tên</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Số điện thoại</Label>
              <Input
                value={phoneVal}
                onChange={(e) => setPhoneVal(e.target.value)}
                className="mt-1"
                placeholder="0901234567"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
              Lưu
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setEditing(false); setName(fullName || ""); setPhoneVal(phone || ""); }}
            >
              Huỷ
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          {email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t flex-wrap">
        {!editing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing(true)}
            className="text-xs"
          >
            <Pencil className="w-3 h-3 mr-1" />
            Sửa thông tin
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleResetPassword}
          disabled={resetting || !email}
          className="text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          {resetting ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <KeyRound className="w-3 h-3 mr-1" />
          )}
          Đặt lại mật khẩu
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleRole}
          className={`text-xs ${
            role === "admin"
              ? "text-gray-600 border-gray-200"
              : "text-red-600 border-red-200 hover:bg-red-50"
          }`}
        >
          {role === "admin" ? (
            <><Shield className="w-3 h-3 mr-1" /> Hạ quyền → Khách</>
          ) : (
            <><ShieldCheck className="w-3 h-3 mr-1" /> Nâng quyền → Admin</>
          )}
        </Button>
      </div>
    </Card>
  );
}
