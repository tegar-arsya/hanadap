"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Container,
    Field,
    Heading,
    Input,
    Text,
    VStack,
    Alert,
    HStack,
} from "@chakra-ui/react";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Email atau password salah");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch {
            setError("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="var(--background)"
            p={4}
        >
            <Container maxW="sm">
                <VStack gap={8}>
                    {/* Logo Section */}
                    <VStack gap={2} textAlign="center">
                        <Box
                            w={16}
                            h={16}
                            borderRadius="2xl"
                            bg="var(--active-color-admin)"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mb={2}
                        >
                            <Text fontSize="2xl" fontWeight="bold" color="white">
                                H
                            </Text>
                        </Box>
                        <Heading color="var(--foreground)" size="xl" fontWeight="bold">
                            Hanadap
                        </Heading>
                        <Text color="var(--sidebar-text-muted)" fontSize="md">
                            Sistem Inventori FIFO
                        </Text>
                    </VStack>

                    {/* Login Card */}
                    <Box
                        w="full"
                        bg="var(--card-bg)"
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor="var(--card-border)"
                        boxShadow="var(--card-shadow)"
                        p={8}
                    >
                        <form onSubmit={handleSubmit}>
                            <VStack gap={5}>
                                <VStack gap={1} w="full" textAlign="center">
                                    <Heading size="md" color="var(--foreground)">
                                        Selamat Datang
                                    </Heading>
                                    <Text fontSize="sm" color="var(--sidebar-text-muted)">
                                        Masuk ke akun Anda
                                    </Text>
                                </VStack>

                                {error && (
                                    <Alert.Root status="error" borderRadius="lg" bg="var(--stat-red-bg)">
                                        <Alert.Indicator color="var(--stat-red-color)" />
                                        <Alert.Content color="var(--stat-red-color)">{error}</Alert.Content>
                                    </Alert.Root>
                                )}

                                <Field.Root required w="full">
                                    <Field.Label color="var(--foreground)" fontSize="sm" fontWeight="medium">
                                        Email
                                    </Field.Label>
                                    <HStack
                                        w="full"
                                        bg="var(--input-bg)"
                                        border="1px solid"
                                        borderColor="var(--input-border)"
                                        borderRadius="lg"
                                        px={3}
                                        _focusWithin={{
                                            borderColor: "var(--input-focus-border)",
                                            boxShadow: "0 0 0 1px var(--input-focus-border)",
                                        }}
                                    >
                                        <FiMail color="var(--sidebar-text-muted)" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="email@example.com"
                                            variant="unstyled"
                                            py={3}
                                            color="var(--foreground)"
                                            _placeholder={{ color: "var(--sidebar-text-muted)" }}
                                        />
                                    </HStack>
                                </Field.Root>

                                <Field.Root required w="full">
                                    <Field.Label color="var(--foreground)" fontSize="sm" fontWeight="medium">
                                        Password
                                    </Field.Label>
                                    <HStack
                                        w="full"
                                        bg="var(--input-bg)"
                                        border="1px solid"
                                        borderColor="var(--input-border)"
                                        borderRadius="lg"
                                        px={3}
                                        _focusWithin={{
                                            borderColor: "var(--input-focus-border)",
                                            boxShadow: "0 0 0 1px var(--input-focus-border)",
                                        }}
                                    >
                                        <FiLock color="var(--sidebar-text-muted)" />
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            variant="unstyled"
                                            py={3}
                                            color="var(--foreground)"
                                            _placeholder={{ color: "var(--sidebar-text-muted)" }}
                                        />
                                    </HStack>
                                </Field.Root>

                                <Button
                                    type="submit"
                                    colorPalette="blue"
                                    size="lg"
                                    w="full"
                                    loading={loading}
                                    loadingText="Masuk..."
                                    borderRadius="lg"
                                    fontWeight="medium"
                                >
                                    <FiLogIn />
                                    Masuk
                                </Button>
                            </VStack>
                        </form>
                    </Box>

                    <Text fontSize="sm" color="var(--sidebar-text-muted)">
                        © 2026 Hanadap. All rights reserved.
                    </Text>
                </VStack>
            </Container>
        </Box>
    );
}
