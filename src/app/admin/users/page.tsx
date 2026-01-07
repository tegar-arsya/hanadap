"use client";

import { useState, useEffect } from "react";
import {
    VStack,
    HStack,
    Button,
    Input,
    Table,
    Badge,
    NativeSelect,
    Dialog,
    Field,
    IconButton,
    Text,
    Box,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiEdit, FiKey, FiUserX, FiUserCheck, FiUsers } from "react-icons/fi";
import {
    PageHeader,
    Card,
    SearchInput,
    PrimaryButton,
    StatusBadge,
    TableLoadingRow,
    TableEmptyRow,
} from "@/components/ui/shared";

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
        <>
            <PageHeader
                title="Manajemen User"
                description="Kelola akun pengguna sistem"
            >
                <PrimaryButton icon={FiPlus} onClick={() => setIsOpen(true)}>
                    Tambah User
                </PrimaryButton>
            </PageHeader>

            <Card>
                <Box mb={4}>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Cari user..."
                    />
                </Box>

                <Box overflowX="auto" mx={-5} mb={-5}>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row bg="var(--table-header-bg)">
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">User</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Role</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Unit Kerja</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Status</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Aksi</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {loading ? (
                                <TableLoadingRow colSpan={5} />
                            ) : filtered.length === 0 ? (
                                <TableEmptyRow
                                    colSpan={5}
                                    message="Tidak ada user ditemukan"
                                    description="Coba ubah filter atau kata kunci pencarian"
                                />
                            ) : (
                                filtered.map((user) => (
                                    <Table.Row key={user.id} opacity={user.isActive ? 1 : 0.5} _hover={{ bg: "var(--table-row-hover)" }}>
                                        <Table.Cell px={5} py={3}>
                                            <VStack align="start" gap={0}>
                                                <Text fontWeight="medium" color="var(--foreground)">{user.nama}</Text>
                                                <Text fontSize="sm" color="var(--sidebar-text-muted)">{user.email}</Text>
                                            </VStack>
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3}>
                                            <StatusBadge
                                                status={ROLES.find(r => r.value === user.role)?.label || user.role}
                                                colorScheme={ROLES.find(r => r.value === user.role)?.color as "red" | "orange" | "blue" || "gray"}
                                            />
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3} color="var(--foreground)">{user.unitKerja?.nama || "-"}</Table.Cell>
                                        <Table.Cell px={5} py={3}>
                                            <StatusBadge
                                                status={user.isActive ? "Aktif" : "Nonaktif"}
                                                colorScheme={user.isActive ? "green" : "gray"}
                                            />
                                        </Table.Cell>
                                        <Table.Cell px={5} py={3}>
                                            <HStack>
                                                <IconButton aria-label="Edit" size="xs" variant="ghost" onClick={() => handleEdit(user)}>
                                                    <FiEdit />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Reset Password"
                                                    size="xs"
                                                    variant="ghost"
                                                    onClick={() => { setSelectedUserId(user.id); setIsPwOpen(true); }}
                                                >
                                                    <FiKey />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Toggle Active"
                                                    size="xs"
                                                    colorPalette={user.isActive ? "red" : "green"}
                                                    variant="ghost"
                                                    onClick={() => handleToggleActive(user)}
                                                >
                                                    {user.isActive ? <FiUserX /> : <FiUserCheck />}
                                                </IconButton>
                                            </HStack>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) resetForm(); }}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner>
                    <Dialog.Content bg="var(--card-bg)" borderColor="var(--card-border)">
                        <Dialog.Header borderBottom="1px solid" borderColor="var(--card-border)">
                            <Dialog.Title color="var(--foreground)">{editingUser ? "Edit User" : "Tambah User"}</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body py={5}>
                            <VStack gap={4}>
                                {!editingUser && (
                                    <>
                                        <Field.Root required>
                                            <Field.Label color="var(--foreground)">Email</Field.Label>
                                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} bg="var(--input-bg)" borderColor="var(--input-border)" color="var(--foreground)" />
                                        </Field.Root>
                                        <Field.Root required>
                                            <Field.Label color="var(--foreground)">Password</Field.Label>
                                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} bg="var(--input-bg)" borderColor="var(--input-border)" color="var(--foreground)" />
                                        </Field.Root>
                                    </>
                                )}
                                <Field.Root required>
                                    <Field.Label color="var(--foreground)">Nama</Field.Label>
                                    <Input value={nama} onChange={(e) => setNama(e.target.value)} bg="var(--input-bg)" borderColor="var(--input-border)" color="var(--foreground)" />
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label color="var(--foreground)">Role</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field value={role} onChange={(e) => setRole(e.target.value)} bg="var(--input-bg)" borderColor="var(--input-border)" color="var(--foreground)">
                                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label color="var(--foreground)">Unit Kerja</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field value={unitKerjaId} onChange={(e) => setUnitKerjaId(e.target.value)} bg="var(--input-bg)" borderColor="var(--input-border)" color="var(--foreground)">
                                            <option value="">Tidak ada</option>
                                            {unitKerjaList.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer borderTop="1px solid" borderColor="var(--card-border)">
                            <Button variant="ghost" mr={3} onClick={resetForm}>Batal</Button>
                            <Button colorPalette="blue" onClick={handleSubmit}>Simpan</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* Reset Password Dialog */}
            <Dialog.Root open={isPwOpen} onOpenChange={(e) => setIsPwOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner>
                    <Dialog.Content bg="var(--card-bg)" borderColor="var(--card-border)">
                        <Dialog.Header borderBottom="1px solid" borderColor="var(--card-border)">
                            <Dialog.Title color="var(--foreground)">Reset Password</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body py={5}>
                            <Field.Root>
                                <Field.Label color="var(--foreground)">Password Baru</Field.Label>
                                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} bg="var(--input-bg)" borderColor="var(--input-border)" color="var(--foreground)" />
                            </Field.Root>
                        </Dialog.Body>
                        <Dialog.Footer borderTop="1px solid" borderColor="var(--card-border)">
                            <Button variant="ghost" mr={3} onClick={() => setIsPwOpen(false)}>Batal</Button>
                            <Button colorPalette="blue" onClick={handleResetPassword} disabled={!newPassword}>Reset</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
}
