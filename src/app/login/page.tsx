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
  Flex,
  Icon,
  Separator
} from "@chakra-ui/react";
import { FiMail, FiLock, FiLogIn, FiGrid } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Warna BPS
  const BPS_BLUE = "#005DA6";
  const BPS_ORANGE = "#F7931E";

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
        setError("Email atau password tidak valid.");
      } else {
        router.push("/dashboard"); // Middleware akan handle redirect user/admin
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      position="relative"
      overflow="hidden"
    >
      {/* Background Decoration (Dot Pattern) */}
      <Box
        position="absolute"
        top={0} left={0} right={0} bottom={0}
        opacity={0.4}
        backgroundImage="radial-gradient(#CBD5E0 1px, transparent 1px)"
        backgroundSize="24px 24px"
        zIndex={0}
      />

      <Container maxW="sm" position="relative" zIndex={1}>
        <VStack gap={8}>
          
          {/* Logo & Header */}
          <VStack gap={4} textAlign="center">
            <Flex
              w={16} h={16}
              bg={BPS_BLUE}
              borderRadius="xl"
              align="center"
              justify="center"
              color="white"
              boxShadow="lg"
            >
              <Icon as={FiGrid} boxSize={8} />
            </Flex>
            <VStack gap={0}>
              <Heading size="xl" fontWeight="800" color="gray.800">
                HANADAP
              </Heading>
              <Text color="gray.500" fontSize="md" fontWeight="medium">
                Sistem Logistik Badan Pusat Statistik
              </Text>
            </VStack>
          </VStack>

          {/* Login Card */}
          <Box
            w="full"
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            p={8}
            border="1px solid"
            borderColor="gray.100"
          >
            <form onSubmit={handleSubmit}>
              <VStack gap={6}>
                <VStack gap={1} w="full" align="start">
                  <Heading size="sm" color="gray.700">Login Akun</Heading>
                  <Text fontSize="sm" color="gray.500">Masuk untuk mengelola inventaris.</Text>
                </VStack>

                {error && (
                  <Alert.Root status="error" variant="subtle" borderRadius="md">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title fontSize="sm">Gagal Masuk</Alert.Title>
                      <Alert.Description fontSize="xs">{error}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}

                <VStack gap={4} w="full">
                  <Field.Root required>
                    <Field.Label fontSize="sm" fontWeight="medium" color="gray.600">
                        Email Kedinasan
                    </Field.Label>
                    <HStack
                      w="full"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      px={3}
                      transition="all 0.2s"
                      _focusWithin={{
                        borderColor: BPS_BLUE,
                        boxShadow: `0 0 0 1px ${BPS_BLUE}`,
                        bg: "white"
                      }}
                    >
                      <Icon as={FiMail} color="gray.400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@bps.go.id"
                        py={3}
                        px={2}
                        color="gray.800"
                      />
                    </HStack>
                  </Field.Root>

                  <Field.Root required>
                    <Flex justify="space-between" w="full">
                       <Field.Label fontSize="sm" fontWeight="medium" color="gray.600">Password</Field.Label>
                    </Flex>
                    <HStack
                      w="full"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      px={3}
                      transition="all 0.2s"
                      _focusWithin={{
                        borderColor: BPS_BLUE,
                        boxShadow: `0 0 0 1px ${BPS_BLUE}`,
                        bg: "white"
                      }}
                    >
                      <Icon as={FiLock} color="gray.400" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        py={3}
                        px={2}
                        color="gray.800"
                      />
                    </HStack>
                  </Field.Root>
                </VStack>

                <Button
                  type="submit"
                  bg={BPS_BLUE}
                  color="white"
                  size="lg"
                  w="full"
                  mt={2}
                  loading={loading}
                  loadingText="Memverifikasi..."
                  _hover={{ bg: "#00457C" }}
                  borderRadius="lg"
                  fontWeight="bold"
                >
                  <FiLogIn style={{ marginRight: "8px" }} />
                  Masuk
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Footer */}
          <Text fontSize="xs" color="gray.400" textAlign="center">
            &copy; {new Date().getFullYear()} Badan Pusat Statistik.<br/>
            All rights reserved.
          </Text>

        </VStack>
      </Container>
    </Flex>
  );
}