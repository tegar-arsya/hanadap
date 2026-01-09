"use client";

import { useState, useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import {
   FiPlus,
   FiEdit,
   FiKey,
   FiUserX,
   FiUserCheck,
   FiSearch,
   FiFilter,
   FiUser,
   FiX
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
   { value: "ADMIN", label: "Administrator", color: "bg-red-500" },
   { value: "KEPALA_UNIT", label: "Kepala Unit", color: "bg-orange-500" },
   { value: "UNIT_KERJA", label: "Staf Unit Kerja", color: "bg-blue-500" },
];

// --- MODAL COMPONENT ---
interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   title: string;
   children: React.ReactNode;
   footer?: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
         />

         {/* Modal Content */}
         <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
               <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
               <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
               >
                  <FiX className="w-5 h-5" />
               </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
               {children}
            </div>

            {/* Footer */}
            {footer && (
               <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  {footer}
               </div>
            )}
         </div>
      </div>
   );
}

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
      if (!nama || !role) {
         toaster.create({ title: "Nama dan Role wajib diisi", type: "error" });
         return;
      }

      try {
         if (editingUser) {
            await fetch("/api/users", {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ id: editingUser.id, nama, role, unitKerjaId: unitKerjaId || null }),
            });
            Swal.fire({ title: "Berhasil!", text: "Data user diperbarui.", icon: "success", timer: 1500, showConfirmButton: false });
         } else {
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
      setEmail(user.email);
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
      if (!newPassword) return;

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
      <div>
         {/* HEADER PAGE */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
               <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
               <p className="text-gray-500 text-sm mt-1">Kelola akun, hak akses, dan status pengguna sistem.</p>
            </div>
            <button
               onClick={() => setIsOpen(true)}
               className="flex items-center gap-2 px-4 py-2.5 bg-[#005DA6] text-white rounded-lg font-medium hover:bg-[#00457C] transition-colors shadow-sm"
            >
               <FiPlus className="w-4 h-4" />
               Tambah User
            </button>
         </div>

         {/* SEARCH CARD */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200 focus-within:border-[#005DA6] focus-within:ring-1 focus-within:ring-[#005DA6] transition-all">
                     <FiSearch className="w-4 h-4 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Cari nama atau email user..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
               </div>
               <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiFilter className="w-4 h-4" />
                  Filter
               </button>
            </div>
         </div>

         {/* TABLE */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Pengguna</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Role</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Unit Kerja</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {loading ? (
                        <tr>
                           <td colSpan={5} className="text-center py-12 text-gray-500">
                              <div className="flex items-center justify-center gap-2">
                                 <svg className="animate-spin h-5 w-5 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 <span>Memuat data...</span>
                              </div>
                           </td>
                        </tr>
                     ) : filtered.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="text-center py-12">
                              <div className="flex flex-col items-center gap-2 text-gray-400">
                                 <FiUser className="w-10 h-10" />
                                 <span>Tidak ada user ditemukan.</span>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        filtered.map((user, index) => {
                           const roleObj = ROLES.find(r => r.value === user.role);
                           return (
                              <tr
                                 key={user.id}
                                 className={`hover:bg-gray-50 transition-colors ${!user.isActive ? "opacity-60" : ""} ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                              >
                                 <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                       <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                                          {user.nama.substring(0, 2).toUpperCase()}
                                       </div>
                                       <div>
                                          <div className="font-medium text-gray-800">{user.nama}</div>
                                          <div className="text-xs text-gray-500">{user.email}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3">
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium text-white rounded-full ${roleObj?.color || "bg-gray-500"}`}>
                                       {roleObj?.label || user.role}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3 text-gray-600 text-sm">
                                    {user.unitKerja?.nama || <span className="text-gray-400">-</span>}
                                 </td>
                                 <td className="px-4 py-3">
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                       {user.isActive ? "Aktif" : "Nonaktif"}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                       <button
                                          onClick={() => handleEdit(user)}
                                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                          title="Edit"
                                       >
                                          <FiEdit className="w-4 h-4" />
                                       </button>
                                       <button
                                          onClick={() => { setSelectedUserId(user.id); setIsPwOpen(true); }}
                                          className="p-2 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                                          title="Reset Password"
                                       >
                                          <FiKey className="w-4 h-4" />
                                       </button>
                                       <button
                                          onClick={() => handleToggleActive(user)}
                                          className={`p-2 rounded-lg transition-colors ${user.isActive ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}`}
                                          title={user.isActive ? "Nonaktifkan" : "Aktifkan"}
                                       >
                                          {user.isActive ? <FiUserX className="w-4 h-4" /> : <FiUserCheck className="w-4 h-4" />}
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* --- MODAL TAMBAH/EDIT USER --- */}
         <Modal
            isOpen={isOpen}
            onClose={resetForm}
            title={editingUser ? "Edit Data User" : "Tambah User Baru"}
            footer={
               <>
                  <button
                     onClick={resetForm}
                     className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                     Batal
                  </button>
                  <button
                     onClick={handleSubmit}
                     className="px-4 py-2 bg-[#005DA6] text-white rounded-lg hover:bg-[#00457C] transition-colors"
                  >
                     Simpan Data
                  </button>
               </>
            }
         >
            <div className="flex flex-col gap-4">
               {!editingUser && (
                  <>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                           Email (untuk login) <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="nama@bps.go.id"
                           className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent transition-all text-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                           Password <span className="text-red-500">*</span>
                        </label>
                        <input
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="******"
                           className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent transition-all text-sm"
                        />
                     </div>
                  </>
               )}

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                     Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                     type="text"
                     value={nama}
                     onChange={(e) => setNama(e.target.value)}
                     placeholder="Nama Pegawai"
                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent transition-all text-sm"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                     Role Akses <span className="text-red-500">*</span>
                  </label>
                  <select
                     value={role}
                     onChange={(e) => setRole(e.target.value)}
                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent transition-all text-sm bg-white"
                  >
                     {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                     Unit Kerja
                  </label>
                  <select
                     value={unitKerjaId}
                     onChange={(e) => setUnitKerjaId(e.target.value)}
                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent transition-all text-sm bg-white"
                  >
                     <option value="">-- Tidak Ada / Pusat --</option>
                     {unitKerjaList.map(u => (
                        <option key={u.id} value={u.id}>{u.nama}</option>
                     ))}
                  </select>
               </div>
            </div>
         </Modal>

         {/* --- MODAL RESET PASSWORD --- */}
         <Modal
            isOpen={isPwOpen}
            onClose={() => setIsPwOpen(false)}
            title="Reset Password"
            footer={
               <>
                  <button
                     onClick={() => setIsPwOpen(false)}
                     className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                     Batal
                  </button>
                  <button
                     onClick={handleResetPassword}
                     disabled={!newPassword}
                     className="px-4 py-2 bg-[#005DA6] text-white rounded-lg hover:bg-[#00457C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     Reset Password
                  </button>
               </>
            }
         >
            <div className="flex flex-col gap-4">
               <p className="text-sm text-gray-500">
                  Masukkan password baru untuk user ini. Password lama akan diganti secara permanen.
               </p>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                     Password Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                     type="password"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     placeholder="Minimal 6 karakter"
                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent transition-all text-sm"
                  />
               </div>
            </div>
         </Modal>
      </div>
   );
}