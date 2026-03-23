"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import styles from "./TopNav.module.css";
import { getToken } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function TopNav() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getToken()));
  }, []);

  return (
    <div className={styles.nav}>
      <Link href="/" className={styles.brand}>
        AI Log &amp; Trace Debugger
      </Link>

      <div className={styles.right}>
        {authed ? (
          <>
            <Link href="/traces" className={styles.link}>
              Dashboard
            </Link>
            <LogoutButton />
          </>
        ) : (
          <Link href="/login" className={styles.link}>
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
