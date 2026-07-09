import { RouterProvider } from "@tanstack/react-router";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmi.config";
import "@rainbow-me/rainbowkit/styles.css";

// Use getRouter() which properly passes queryClient into the router context
import { getRouter, queryClient } from "./router";

const router = getRouter();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RouterProvider router={router} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
