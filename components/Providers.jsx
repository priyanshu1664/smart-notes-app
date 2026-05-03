"use client";

import { SessionProvider } from "next-auth/react";
import ReduxProvider from "@/store/ReduxProvider";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ReduxProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "pink",
              color: "black",
              borderRadius: "10px",
              padding: "10px 14px",
            },
          }}
        />
        {children}
      </ReduxProvider>
    </SessionProvider>
  );
}
