"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

export default function LogoutButton() {
  const router = useRouter();

  function logout() {
    clearToken();
    router.push("/");
  }

  return (
    <button className="btn" type="button" onClick={logout}>
      Logout
    </button>
  );
}
