"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IconButton, Box } from "@chakra-ui/react";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";

export function ColorModeButton() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <IconButton
                aria-label="Toggle color mode"
                variant="ghost"
                size="sm"
                rounded="full"
            >
                <Box w="18px" h="18px" />
            </IconButton>
        );
    }

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    const getIcon = () => {
        if (theme === "light") return <FiSun size={18} />;
        if (theme === "dark") return <FiMoon size={18} />;
        return <FiMonitor size={18} />;
    };

    const getLabel = () => {
        if (theme === "light") return "Light mode";
        if (theme === "dark") return "Dark mode";
        return "System theme";
    };

    return (
        <IconButton
            aria-label={getLabel()}
            variant="ghost"
            size="sm"
            rounded="full"
            onClick={cycleTheme}
            title={getLabel()}
        >
            {getIcon()}
        </IconButton>
    );
}

export function ColorModeScript() {
    return null; // next-themes handles this via ThemeProvider
}
