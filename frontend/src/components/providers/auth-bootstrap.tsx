"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { getCurrentSession } from "@/lib/auth/auth-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCredentials, setCurrentUser } from "@/store/slices/auth-slice";

const sessionCheckIntervalMs = 30000;

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const isHandlingSessionFailure = useRef(false);

  useEffect(() => {
    let isMounted = true;

    getCurrentSession().then((session) => {
      if (isMounted) {
        dispatch(setCurrentUser(session.data.user));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!user || pathname === "/") {
      return;
    }

    let isMounted = true;

    async function verifySession() {
      const session = await getCurrentSession();

      if (!isMounted || session.data.user || isHandlingSessionFailure.current) {
        return;
      }

      isHandlingSessionFailure.current = true;
      dispatch(clearCredentials());
      const message = session.reason === "terminated"
        ? "Session terminated. Log in again."
        : session.reason === "deleted"
          ? "Account deleted. Log in again."
          : "Session expired. Log in again.";

      toast.error(message);
      router.replace("/");
      router.refresh();
    }

    void verifySession();

    const intervalId = window.setInterval(() => {
      void verifySession();
    }, sessionCheckIntervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void verifySession();
      }
    };

    window.addEventListener("focus", verifySession);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", verifySession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch, pathname, router, user]);

  return null;
}