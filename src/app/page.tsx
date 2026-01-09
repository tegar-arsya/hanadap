"use client";

import Link from "next/link";
import { FiActivity, FiClipboard, FiPackage, FiShield, FiArrowRight, FiCheck } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white overflow-hidden">

      {/* --- NAVBAR --- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3" : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-blue-500 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xl">H</div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? "text-gray-900" : "text-gray-900"}`}>Hanadap</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm ${scrolled
                  ? "bg-[#005DA6] text-white hover:bg-[#00457C] shadow-lg shadow-blue-500/30"
                  : "bg-white text-[#005DA6] hover:bg-gray-50 shadow-md"
                }`}
            >
              Login Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-[#005DA6]/10 rounded-full blur-[100px] animate-pulse-slow -z-10" />
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-[#F7931E]/10 rounded-full blur-[80px] animate-float -z-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#005DA6] text-sm font-semibold mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Internal Ops Only
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Kelola Inventaris BARANGMU <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005DA6] to-[#0096C7]">
                Lebih Cerdas & Efisien
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Sistem manajemen stok terintegrasi dengan persetujuan digital, pelacakan
              <em> real-time</em>, dan audit transparan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/request"
                className="w-full sm:w-auto px-8 py-4 bg-[#005DA6] text-white rounded-xl font-bold text-lg hover:bg-[#00457C] transition-all shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <FiClipboard className="w-5 h-5" />
                Ajukan Permintaan
              </Link>
              <Link
                href="/tracking"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Cek Status
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      {/* <section className="border-y border-gray-200 bg-white/50 backdrop-blur-sm -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Unit Kerja Terdaftar", value: "30+" },
              { label: "Permintaan Diproses", value: "1,200+" },
              { label: "Efisiensi Waktu", value: "85%" },
              { label: "Akurasi Stok", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      
      {/* <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Dirancang khusus untuk memenuhi kebutuhan birokrasi yang cepat namun tetap akuntabel.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Manajemen Stok FIFO",
                desc: "Otomatisasi pengurutan barang berdasarkan tanggal masuk untuk meminimalisir barang kadaluarsa.",
                icon: FiPackage,
                color: "bg-blue-100 text-blue-600",
              },
              {
                title: "Approval Berjenjang",
                desc: "Sistem persetujuan digital yang fleksibel, memastikan setiap permintaan tervalidasi dengan benar.",
                icon: FiCheck,
                color: "bg-green-100 text-green-600",
              },
              {
                title: "Pelacakan Real-time",
                desc: "Pantau status permohonan Anda dari mana saja, kapan saja dengan nomor tiket unik.",
                icon: FiActivity,
                color: "bg-orange-100 text-orange-600",
              },
              {
                title: "Audit & Laporan",
                desc: "Log aktivitas lengkap dan fitur export laporan (Excel/PDF) untuk keperluan administrasi.",
                icon: FiShield,
                color: "bg-purple-100 text-purple-600",
              },
              {
                title: "Notifikasi Otomatis",
                desc: "Informasi status permintaan langsung melalui dashboard tanpa perlu cek manual berulang kali.",
                icon: FiCheckingBox,
                color: "bg-pink-100 text-pink-600",
              },
              {
                title: "Akses Role-Based",
                desc: "Keamanan terjamin dengan pembagian hak akses yang jelas antara Admin, Unit Kerja, dan Pengguna.",
                icon: FiUsers,
                color: "bg-teal-100 text-teal-600",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#005DA6] transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      
      {/* <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#005DA6] to-[#003366] rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Siap Mengoptimalkan Kinerja?</h2>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Bergabunglah dengan transformasi digital BARANGMU. Mulai kelola permintaan dan stok barang dengan cara yang lebih modern.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-[#005DA6] rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg"
              >
                Login Sebagai Admin
              </Link>
              <Link
                href="/request"
                className="px-8 py-4 bg-[#F7931E] text-white rounded-xl font-bold text-lg hover:bg-[#D87C10] transition-all shadow-lg"
              >
                Buat Permintaan Baru
              </Link>
            </div>
          </div>
        </div>
      </section> */}

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <span className="font-bold text-gray-900">Hanadap</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Hana Corp. Internal Use Only.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Icons helper component (since we used some not imported yet)
// function FiCheckingBox(props: any) {
//   return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
// }

// function FiUsers(props: any) {
//   return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
// }