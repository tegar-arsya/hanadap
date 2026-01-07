"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    Button,
    Input,
    Table,
    Badge,
    NativeSelect,
    Dialog,
    Field,
    IconButton,
    Group,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiEdit, FiKey, FiUserX, FiUserCheck, FiSearch } from "react-icons/fi";

interface User {
    id: string;
    email: string;
    nama: string;
    role: string;
    isActive: boolean;
    unitKerjaId: string | null;
    unitKerja: { nama: string; kode: string } | null;
}

interface UnitKerja {
    id: string;
    nama: string;
    kode: string;
}

const ROLES = [
    { value: "ADMIN", label: "Admin", color: "red" },
    { value: "KEPALA_UNIT", label: "Kepala Unit", color: "orange" },
    { value: "UNIT_KERJA", label: "Unit Kerja", color: "blue" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isPwOpen, setIsPwOpen] = useState(false);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nama, setNama] = useState("");
    const [role, setRole] = useState("UNIT_KERJA");
    const [unitKerjaId, setUnitKerjaId] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");

    const showToast = (title: string, type: "success" | "error" | "info") => {
        toaster.create({ title, type });
    };

    const fetchData = async () => {
        const [usersRes, unitRes] = await Promise.all([
            fetch("/api/users"),
            fetch("/api/unit-kerja"),
        ]);
        setUsers(await usersRes.json());
        setUnitKerjaList(await unitRes.json());
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => {
        setEditingUser(null);
        setEmail(""); setPassword(""); setNama("");
        setRole("UNIT_KERJA"); setUnitKerjaId("");
        setIsOpen(false);
    };

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                await fetch("/api/users", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingUser.id, nama, role, unitKerjaId: unitKerjaId || null }),
                });
                showToast("User berhasil diupdate", "success");
            } else {
                await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, nama, role, unitKerjaId: unitKerjaId || null }),
                });
                showToast("User berhasil ditambahkan", "success");
            }
            resetForm();
            fetchData();
        } catch (error) {
            showToast("Gagal menyimpan user", "error");
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setNama(user.nama);
        setRole(user.role);
        setUnitKerjaId(user.unitKerjaId || "");
        setIsOpen(true);
    };

    const handleToggleActive = async (user: User) => {
        await fetch("/api/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
        });
        showToast(user.isActive ? "User dinonaktifkan" : "User diaktifkan", "info");
        fetchData();
    };

    const handleResetPassword = async () => {
        await fetch("/api/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: selectedUserId, newPassword }),
        });
        showToast("Password berhasil direset", "success");
        setNewPassword("");
        setIsPwOpen(false);
    };

    const filtered = users.filter(u =>
        u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <HStack justify="space-between" mb={8}>
                <VStack align="start" gap={1}>
                    <Heading size="lg">Manajemen User</Heading>
                    <Text color="gray.500">Kelola akun pengguna sistem</Text>
                </VStack>
                <Button colorPalette="blue" onClick={() => setIsOpen(true)}>
                    <FiPlus />
                    Tambah User
                </Button>
            </HStack>

            <Card.Root mb={6}>
                <Card.Body>
                    <Group>
                        <FiSearch />
                        <Input placeholder="Cari user..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </Group>
                </Card.Body>
            </Card.Root>

            <Card.Root>
                <Card.Body p={0}>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row bg="gray.50">
                                <Table.ColumnHeader>User</Table.ColumnHeader>
                                <Table.ColumnHeader>Role</Table.ColumnHeader>
                                <Table.ColumnHeader>Unit Kerja</Table.ColumnHeader>
                                <Table.ColumnHeader>Status</Table.ColumnHeader>
                                <Table.ColumnHeader>Aksi</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {filtered.map((user) => (
                                <Table.Row key={user.id} opacity={user.isActive ? 1 : 0.5}>
                                    <Table.Cell>
                                        <VStack align="start" gap={0}>
                                            <Text fontWeight="medium">{user.nama}</Text>
                                            <Text fontSize="sm" color="gray.500">{user.email}</Text>
                                        </VStack>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={ROLES.find(r => r.value === user.role)?.color}>
                                            {ROLES.find(r => r.value === user.role)?.label}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>{user.unitKerja?.nama || "-"}</Table.Cell>
                                    <Table.Cell>
                                        <Badge colorPalette={user.isActive ? "green" : "gray"}>
                                            {user.isActive ? "Aktif" : "Nonaktif"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <HStack>
                                            <IconButton aria-label="Edit" size="sm" onClick={() => handleEdit(user)}>
                                                <FiEdit />
                                            </IconButton>
                                            <IconButton
                                                aria-label="Reset Password"
                                                size="sm"
                                                onClick={() => { setSelectedUserId(user.id); setIsPwOpen(true); }}
                                            >
                                                <FiKey />
                                            </IconButton>
                                            <IconButton
                                                aria-label="Toggle Active"
                                                size="sm"
                                                colorPalette={user.isActive ? "red" : "green"}
                                                variant="ghost"
                                                onClick={() => handleToggleActive(user)}
                                            >
                                                {user.isActive ? <FiUserX /> : <FiUserCheck />}
                                            </IconButton>
                                        </HStack>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Card.Body>
            </Card.Root>

            {/* Add/Edit Dialog */}
            <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) resetForm(); }}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{editingUser ? "Edit User" : "Tambah User"}</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack gap={4}>
                                {!editingUser && (
                                    <>
                                        <Field.Root required>
                                            <Field.Label>Email</Field.Label>
                                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        </Field.Root>
                                        <Field.Root required>
                                            <Field.Label>Password</Field.Label>
                                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        </Field.Root>
                                    </>
                                )}
                                <Field.Root required>
                                    <Field.Label>Nama</Field.Label>
                                    <Input value={nama} onChange={(e) => setNama(e.target.value)} />
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label>Role</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field value={role} onChange={(e) => setRole(e.target.value)}>
                                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label>Unit Kerja</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field value={unitKerjaId} onChange={(e) => setUnitKerjaId(e.target.value)}>
                                            <option value="">Tidak ada</option>
                                            {unitKerjaList.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" mr={3} onClick={resetForm}>Batal</Button>
                            <Button colorPalette="blue" onClick={handleSubmit}>Simpan</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* Reset Password Dialog */}
            <Dialog.Root open={isPwOpen} onOpenChange={(e) => setIsPwOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Reset Password</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <Field.Root>
                                <Field.Label>Password Baru</Field.Label>
                                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </Field.Root>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" mr={3} onClick={() => setIsPwOpen(false)}>Batal</Button>
                            <Button colorPalette="blue" onClick={handleResetPassword} disabled={!newPassword}>Reset</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Box>
    );
}
