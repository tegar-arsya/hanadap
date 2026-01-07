"use client";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";

const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors: {
                brand: {
                    50: { value: "#e6f6ff" },
                    100: { value: "#bae3ff" },
                    200: { value: "#7cc4fa" },
                    300: { value: "#47a3f3" },
                    400: { value: "#2186eb" },
                    500: { value: "#0967d2" },
                    600: { value: "#0552b5" },
                    700: { value: "#03449e" },
                    800: { value: "#01337d" },
                    900: { value: "#002159" },
                },
            },
            fonts: {
                heading: { value: "Inter, system-ui, sans-serif" },
                body: { value: "Inter, system-ui, sans-serif" },
            },
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ChakraProvider value={system}>
                    {children}
                    <Toaster />
                </ChakraProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
