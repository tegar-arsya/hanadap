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
    Card,
    Group,
} from "@chakra-ui/react";
import { FiMail, FiLock } from "react-icons/fi";

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
        <Box minH="100vh" bgGradient="to-br" gradientFrom="blue.500" gradientTo="blue.700" py={20}>
            <Container maxW="md">
                <VStack gap={8}>
                    <VStack gap={2} textAlign="center">
                        <Heading color="white" size="2xl" fontWeight="bold">
                            Hanadap
                        </Heading>
                        <Text color="whiteAlpha.800" fontSize="lg">
                            Sistem Inventori FIFO
                        </Text>
                    </VStack>

                    <Card.Root w="full" shadow="2xl" borderRadius="2xl">
                        <Card.Body p={8}>
                            <form onSubmit={handleSubmit}>
                                <VStack gap={5}>
                                    <Heading size="md" color="gray.700">
                                        Login
                                    </Heading>

                                    {error && (
                                        <Alert.Root status="error" borderRadius="lg">
                                            <Alert.Indicator />
                                            <Alert.Content>{error}</Alert.Content>
                                        </Alert.Root>
                                    )}

                                    <Field.Root required>
                                        <Field.Label color="gray.600">Email</Field.Label>
                                        <Group w="full">
                                            <FiMail color="gray" />
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="email@example.com"
                                                size="lg"
                                                borderRadius="lg"
                                            />
                                        </Group>
                                    </Field.Root>

                                    <Field.Root required>
                                        <Field.Label color="gray.600">Password</Field.Label>
                                        <Group w="full">
                                            <FiLock color="gray" />
                                            <Input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                size="lg"
                                                borderRadius="lg"
                                            />
                                        </Group>
                                    </Field.Root>

                                    <Button
                                        type="submit"
                                        colorPalette="blue"
                                        size="lg"
                                        w="full"
                                        loading={loading}
                                        loadingText="Masuk..."
                                        borderRadius="lg"
                                    >
                                        Masuk
                                    </Button>
                                </VStack>
                            </form>
                        </Card.Body>
                    </Card.Root>
                </VStack>
            </Container>
        </Box>
    );
}
