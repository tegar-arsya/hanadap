"use client"

import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react"
import { ReactNode } from "react"

export interface TooltipProps {
    content: ReactNode
    children: ReactNode
    disabled?: boolean
    placement?: "top" | "bottom" | "left" | "right"
    openDelay?: number
    closeDelay?: number
}

export function Tooltip({
    content,
    children,
    disabled,
    placement,
    openDelay = 0,
    closeDelay = 0
}: TooltipProps) {
    if (disabled) return <>{children}</>

    return (
        <ChakraTooltip.Root
            openDelay={openDelay}
            closeDelay={closeDelay}
            positioning={{ placement }}
        >
            <ChakraTooltip.Trigger asChild>
                {children}
            </ChakraTooltip.Trigger>
            <Portal>
                <ChakraTooltip.Positioner>
                    <ChakraTooltip.Content>
                        <ChakraTooltip.Arrow />
                        {content}
                    </ChakraTooltip.Content>
                </ChakraTooltip.Positioner>
            </Portal>
        </ChakraTooltip.Root>
    )
}
