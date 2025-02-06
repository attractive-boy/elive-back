import Head from "next/head";
import { useState } from "react";
import { Geist } from "next/font/google";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 实现登录逻辑
    console.log("登录信息:", { username, password });
    if (username === "admin" && password === "admin") {
      window.location.href = "/live"
    } else {
      alert("用户名或密码错误")
    }
  };

  return (
    <>
      <Head>
        <title>鹅直播后台管理系统</title>
        <meta name="description" content="鹅直播后台管理系统登录界面" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable}`}>
        <main className={styles.loginMain}>
          <div className={styles.loginBox}>
            <h1 className={styles.title}>鹅直播后台管理系统</h1>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="username">用户名</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="password">密码</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                />
              </div>
              <button type="submit" className={styles.loginButton}>
                登录
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
