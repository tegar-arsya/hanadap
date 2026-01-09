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
  Heading,
  Flex,
  Avatar,
  Card,
  Icon,
  Spinner
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { 
  FiPlus, 
  FiEdit, 
  FiKey, 
  FiUserX, 
  FiUserCheck, 
  FiSearch, 
  FiFilter,
  FiUser
} from "react-icons/fi";
import Swal from "sweetalert2";

// --- TIPE DATA ---
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
  { value: "ADMIN", label: "Administrator", color: "red" },
  { value: "KEPALA_UNIT", label: "Kepala Unit", color: "orange" },
  { value: "UNIT_KERJA", label: "Staf Unit Kerja", color: "blue" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Dialog States
  const [isOpen, setIsOpen] = useState(false);
  const [isPwOpen, setIsPwOpen] = useState(false);

  // Form States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [role, setRole] = useState("UNIT_KERJA");
  const [unitKerjaId, setUnitKerjaId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const BPS_BLUE = "#005DA6";

  const fetchData = async () => {
    try {
      const [usersRes, unitRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/unit-kerja"),
      ]);
      setUsers(await usersRes.json());
      setUnitKerjaList(await unitRes.json());
      setLoading(false);
    } catch (error) {
      console.error("Gagal memuat data", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setEditingUser(null);
    setEmail(""); setPassword(""); setNama("");
    setRole("UNIT_KERJA"); setUnitKerjaId("");
    setIsOpen(false);
  };

  // --- HANDLERS ---

  const handleSubmit = async () => {
    // Validasi sederhana
    if (!nama || !role) {
        toaster.create({ title: "Nama dan Role wajib diisi", type: "error" });
        return;
    }

    try {
      if (editingUser) {
        // Mode Edit
        await fetch("/api/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingUser.id, nama, role, unitKerjaId: unitKerjaId || null }),
        });
        Swal.fire({ title: "Berhasil!", text: "Data user diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
      } else {
        // Mode Tambah
        if (!email || !password) {
            toaster.create({ title: "Email dan Password wajib untuk user baru", type: "error" });
            return;
        }
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, nama, role, unitKerjaId: unitKerjaId || null }),
        });
        Swal.fire({ title: "Berhasil!", text: "User baru ditambahkan.", icon: "success", timer: 1500, showConfirmButton: false });
      }
      resetForm();
      fetchData();
    } catch (error) {
      toaster.create({ title: "Gagal menyimpan data", type: "error" });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setNama(user.nama);
    setEmail(user.email); // Email readonly saat edit biasanya
    setRole(user.role);
    setUnitKerjaId(user.unitKerjaId || "");
    setIsOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    const action = user.isActive ? "Nonaktifkan" : "Aktifkan";
    const color = user.isActive ? "#d33" : "#3085d6";

    const result = await Swal.fire({
        title: `${action} User?`,
        text: user.isActive 
            ? "User ini tidak akan bisa login ke sistem." 
            : "User akan mendapatkan kembali akses login.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: color,
        cancelButtonColor: "#aaa",
        confirmButtonText: `Ya, ${action}`,
        cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
        try {
            await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
            });
            Swal.fire("Sukses", `Status user berhasil diubah.`, "success");
            fetchData();
        } catch (error) {
            toaster.create({ title: "Gagal mengubah status", type: "error" });
        }
    }
  };

  const handleResetPassword = async () => {
    if(!newPassword) return;

    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUserId, newPassword }),
      });
      setIsPwOpen(false);
      setNewPassword("");
      Swal.fire("Berhasil", "Password user telah direset.", "success");
    } catch (error) {
      toaster.create({ title: "Gagal reset password", type: "error" });
    }
  };

  const filtered = users.filter(u =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* HEADER PAGE */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
            <Heading size="xl" color="gray.800" mb={1}>Manajemen Pengguna</Heading>
            <Text color="gray.500">Kelola akun, hak akses, dan status pengguna sistem.</Text>
        </Box>
        <Button 
            bg={BPS_BLUE} 
            color="white" 
            _hover={{ bg: "#00457C" }} 
            onClick={() => setIsOpen(true)}
            size="md"
        >
            <FiPlus style={{ marginRight: "8px" }} /> Tambah User
        </Button>
      </Flex>

      {/* SEARCH CARD */}
      <Card.Root bg="white" shadow="sm" border="1px solid" borderColor="gray.200" mb={6}>
        <Card.Body p={4}>
           <HStack gap={4}>
              <Box flex={1}>
                 <HStack 
                    bg="gray.50" 
                    px={3} py={2} 
                    borderRadius="md" 
                    border="1px solid" 
                    borderColor="gray.200"
                    _focusWithin={{ borderColor: BPS_BLUE, ring: "1px solid " + BPS_BLUE }}
                 >
                    <FiSearch color="gray" />
                    <Input 
                        placeholder="Cari nama atau email user..." 
                        border="none" 
                        _focus={{ outline: "none" }} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        p={0}
                    />
                 </HStack>
              </Box>
              <Button variant="outline" color="gray.600" borderColor="gray.300">
                 <FiFilter style={{ marginRight: "6px" }} /> Filter
              </Button>
           </HStack>
        </Card.Body>
      </Card.Root>

      {/* TABLE */}
      <Card.Root bg="white" shadow="sm" border="1px solid" borderColor="gray.200" overflow="hidden">
         <Box overflowX="auto">
            <Table.Root size="md" interactive striped>
               <Table.Header bg="gray.50">
                  <Table.Row>
                     <Table.ColumnHeader color="gray.600" fontWeight="bold">Pengguna</Table.ColumnHeader>
                     <Table.ColumnHeader color="gray.600" fontWeight="bold">Role</Table.ColumnHeader>
                     <Table.ColumnHeader color="gray.600" fontWeight="bold">Unit Kerja</Table.ColumnHeader>
                     <Table.ColumnHeader color="gray.600" fontWeight="bold">Status</Table.ColumnHeader>
                     <Table.ColumnHeader color="gray.600" fontWeight="bold" textAlign="right">Aksi</Table.ColumnHeader>
                  </Table.Row>
               </Table.Header>
               <Table.Body>
                  {loading ? (
                     <Table.Row>
                        <Table.Cell colSpan={5} textAlign="center" py={10} color="gray.500">
                           <Spinner size="sm" mr={2} /> Memuat data...
                        </Table.Cell>
                     </Table.Row>
                  ) : filtered.length === 0 ? (
                     <Table.Row>
                        <Table.Cell colSpan={5} textAlign="center" py={10}>
                            <VStack color="gray.400">
                               <FiUser size={40} />
                               <Text>Tidak ada user ditemukan.</Text>
                            </VStack>
                        </Table.Cell>
                     </Table.Row>
                  ) : (
                     filtered.map((user) => {
                        const roleObj = ROLES.find(r => r.value === user.role);
                        return (
                           <Table.Row key={user.id} opacity={user.isActive ? 1 : 0.6}>
                              <Table.Cell>
                                 <HStack>
                                    <Avatar.Root size="sm" name={user.nama} colorPalette="blue">
                                       <Avatar.Fallback>{user.nama.substring(0, 2).toUpperCase()}</Avatar.Fallback>
                                    </Avatar.Root>
                                    <Box>
                                       <Text fontWeight="medium" color="gray.800">{user.nama}</Text>
                                       <Text fontSize="xs" color="gray.500">{user.email}</Text>
                                    </Box>
                                 </HStack>
                              </Table.Cell>
                              <Table.Cell>
                                 <Badge colorPalette={roleObj?.color || "gray"} variant="solid">
                                    {roleObj?.label || user.role}
                                 </Badge>
                              </Table.Cell>
                              <Table.Cell color="gray.600">
                                 {user.unitKerja?.nama || <Text as="span" color="gray.400">-</Text>}
                              </Table.Cell>
                              <Table.Cell>
                                 <Badge 
                                    colorPalette={user.isActive ? "green" : "red"} 
                                    variant="subtle"
                                 >
                                    {user.isActive ? "Aktif" : "Nonaktif"}
                                 </Badge>
                              </Table.Cell>
                              <Table.Cell textAlign="right">
                                 <HStack justify="end">
                                    <IconButton 
                                       aria-label="Edit" size="xs" variant="ghost" color="blue.600"
                                       onClick={() => handleEdit(user)}
                                    >
                                       <FiEdit />
                                    </IconButton>
                                    <IconButton 
                                       aria-label="Reset Password" size="xs" variant="ghost" color="orange.500"
                                       onClick={() => { setSelectedUserId(user.id); setIsPwOpen(true); }}
                                    >
                                       <FiKey />
                                    </IconButton>
                                    <IconButton 
                                       aria-label="Toggle Active" size="xs" variant="ghost"
                                       colorPalette={user.isActive ? "red" : "green"}
                                       onClick={() => handleToggleActive(user)}
                                    >
                                       {user.isActive ? <FiUserX /> : <FiUserCheck />}
                                    </IconButton>
                                 </HStack>
                              </Table.Cell>
                           </Table.Row>
                        );
                     })
                  )}
               </Table.Body>
            </Table.Root>
         </Box>
      </Card.Root>

      {/* --- DIALOG TAMBAH/EDIT USER --- */}
      <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) resetForm(); }}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{editingUser ? "Edit Data User" : "Tambah User Baru"}</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4}>
                {!editingUser && (
                   <>
                     <Field.Root required>
                        <Field.Label>Email (untuk login)</Field.Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@bps.go.id" />
                     </Field.Root>
                     <Field.Root required>
                        <Field.Label>Password</Field.Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" />
                     </Field.Root>
                   </>
                )}
                
                <Field.Root required>
                    <Field.Label>Nama Lengkap</Field.Label>
                    <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Pegawai" />
                </Field.Root>

                <Field.Root required>
                    <Field.Label>Role Akses</Field.Label>
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
                            <option value="">-- Tidak Ada / Pusat --</option>
                            {unitKerjaList.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                        </NativeSelect.Field>
                    </NativeSelect.Root>
                </Field.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
               <Button variant="ghost" onClick={resetForm}>Batal</Button>
               <Button bg={BPS_BLUE} color="white" onClick={handleSubmit}>Simpan Data</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* --- DIALOG RESET PASSWORD --- */}
      <Dialog.Root open={isPwOpen} onOpenChange={(e) => setIsPwOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
               <Dialog.Title>Reset Password</Dialog.Title>
               <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
               <Text fontSize="sm" color="gray.500" mb={4}>
                 Masukkan password baru untuk user ini. Password lama akan diganti secara permanen.
               </Text>
               <Field.Root required>
                  <Field.Label>Password Baru</Field.Label>
                  <Input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Minimal 6 karakter"
                  />
               </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
               <Button variant="ghost" onClick={() => setIsPwOpen(false)}>Batal</Button>
               <Button colorPalette="blue" onClick={handleResetPassword} disabled={!newPassword}>
                  Reset Password
               </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

    </Box>
  );
}