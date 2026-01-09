"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn, FiArrowLeft, FiAlertCircle, FiCheck } from "react-icons/fi";
import Link from "next/link";

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
        setError("Email atau password tidak valid.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* --- LEFT SIDE: Login Form --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 relative z-10 bg-white shadow-2xl lg:shadow-none">

        {/* Back Button */}
        <div className="absolute top-6 left-6 lg:top-10 lg:left-10">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#005DA6] transition-colors font-medium">
            <FiArrowLeft /> Kembali
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Logo Brand */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#005DA6] to-[#00457C] text-white font-bold text-2xl shadow-lg shadow-blue-500/20 mb-4">
              H
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Selamat Datang Kembali</h1>
            <p className="text-gray-500 mt-2">Masuk ke panel admin Hanadap untuk mengelola inventaris.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-pulse-slow">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Gagal Masuk</span>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="w-5 h-5 text-gray-400 group-focus-within:text-[#005DA6] transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-gray-200 border rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#005DA6] focus:ring-1 focus:ring-[#005DA6] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <a href="#" className="text-sm text-[#005DA6] hover:underline font-medium">Lupa password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="w-5 h-5 text-gray-400 group-focus-within:text-[#005DA6] transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-gray-200 border rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#005DA6] focus:ring-1 focus:ring-[#005DA6] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-[#005DA6] to-[#00457C] hover:from-[#00457C] hover:to-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005DA6] font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <FiLogIn className="w-5 h-5" /> Masuk Sekarang
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Belum punya akun? <span className="text-gray-900 font-medium">Hubungi Administrator.</span>
            </p>
          </form>
        </div>
      </div>

      {/* --- RIGHT SIDE: Visual/Brand --- */}
      <div className="hidden lg:flex w-1/2 bg-[#005DA6] relative overflow-hidden items-center justify-center p-12 text-white">
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#005DA6]/90 to-[#003366]/90 backdrop-blur-sm z-0" />

        {/* Background Image (Placeholder pattern) */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}
        />

        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl font-extrabold mb-6 leading-tight">Sistem Terintegrasi untuk Kinerja Maksimal.</h2>
          <p className="text-lg text-blue-100 leading-relaxed mb-8">
            Kelola stok, pantau permintaan, dan akses laporan analitik dalam satu platform terpadu. Efisiensi dimulai dari sini.
          </p>

          {/* Mockup Card Illustration */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-500 hover:scale-105 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center text-green-400">
                <FiCheck />
              </div>
              <div className="text-left">
                <div className="h-2 w-24 bg-white/40 rounded mb-1.5"></div>
                <div className="h-1.5 w-16 bg-white/20 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-white/10 rounded"></div>
              <div className="h-1.5 w-5/6 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}