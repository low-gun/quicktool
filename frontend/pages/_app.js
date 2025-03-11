import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (router.pathname === "/login" && token) {
      router.push("/");
    }
  }, [router]);

  return (
    <>
      <Navbar />
      <Component {...pageProps} isLoggedIn={isLoggedIn} />
    </>
  );
}
