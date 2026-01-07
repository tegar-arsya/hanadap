"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import styles from "./scan.module.css";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
    barcode: string | null;
}

export default function AdminScanPage() {
    const [scanning, setScanning] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState("");
    const [foundBarang, setFoundBarang] = useState<Barang | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [jumlah, setJumlah] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    const startScanner = () => {
        setScanning(true);
        setScannedBarcode("");
        setFoundBarang(null);
        setNotFound(false);
        setMessage("");

        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            scanner.render(
                (decodedText) => {
                    setScannedBarcode(decodedText);
                    scanner.clear();
                    setScanning(false);
                    lookupBarang(decodedText);
                },
                (error) => {
                    console.log("Scan error:", error);
                }
            );

            scannerRef.current = scanner;
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
        }
        setScanning(false);
    };

    const lookupBarang = async (barcode: string) => {
        try {
            const res = await fetch("/api/barang");
            const barangList: Barang[] = await res.json();
            const found = barangList.find((b) => b.barcode === barcode);

            if (found) {
                setFoundBarang(found);
                setNotFound(false);
            } else {
                setFoundBarang(null);
                setNotFound(true);
            }
        } catch (error) {
            console.error("Error looking up barang:", error);
        }
    };

    const handleAddStock = async () => {
        if (!foundBarang || !jumlah) return;

        setLoading(true);
        try {
            const res = await fetch("/api/stok", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barangId: foundBarang.id,
                    jumlah: parseInt(jumlah),
                    tanggalMasuk: new Date().toISOString(),
                }),
            });

            if (res.ok) {
                setMessage(`Berhasil menambah ${jumlah} ${foundBarang.satuan} ${foundBarang.nama}`);
                setJumlah("");
                setFoundBarang(null);
                setScannedBarcode("");
            } else {
                setMessage("Gagal menambah stok");
            }
        } catch (error) {
            console.error("Error adding stock:", error);
            setMessage("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        };
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Scan Barcode/QR</h1>
            <p className={styles.subtitle}>Scan barcode untuk tambah stok cepat</p>

            {message && (
                <div className={styles.message}>{message}</div>
            )}

            {!scanning && !foundBarang && (
                <button className={styles.scanBtn} onClick={startScanner}>
                    📷 Mulai Scan
                </button>
            )}

            {scanning && (
                <div className={styles.scannerContainer}>
                    <div id="qr-reader" className={styles.scanner}></div>
                    <button className={styles.cancelBtn} onClick={stopScanner}>
                        Batal
                    </button>
                </div>
            )}

            {scannedBarcode && !foundBarang && !notFound && (
                <div className={styles.loading}>Mencari barang...</div>
            )}

            {notFound && (
                <div className={styles.notFound}>
                    <p>Barcode tidak ditemukan: <code>{scannedBarcode}</code></p>
                    <button className={styles.scanBtn} onClick={startScanner}>
                        Scan Ulang
                    </button>
                </div>
            )}

            {foundBarang && (
                <div className={styles.resultCard}>
                    <h3>Barang Ditemukan</h3>
                    <div className={styles.barangInfo}>
                        <span className={styles.barangName}>{foundBarang.nama}</span>
                        <span className={styles.barangStock}>
                            Stok saat ini: {foundBarang.stokTotal} {foundBarang.satuan}
                        </span>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Jumlah yang ditambahkan</label>
                        <input
                            type="number"
                            min="1"
                            value={jumlah}
                            onChange={(e) => setJumlah(e.target.value)}
                            className={styles.input}
                            placeholder="Masukkan jumlah"
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.addBtn}
                            onClick={handleAddStock}
                            disabled={loading || !jumlah}
                        >
                            {loading ? "Menambahkan..." : "+ Tambah Stok"}
                        </button>
                        <button className={styles.rescanBtn} onClick={startScanner}>
                            Scan Lagi
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.manual}>
                <h4>Input Manual Barcode</h4>
                <div className={styles.manualForm}>
                    <input
                        type="text"
                        placeholder="Ketik barcode..."
                        value={scannedBarcode}
                        onChange={(e) => setScannedBarcode(e.target.value)}
                        className={styles.input}
                    />
                    <button
                        className={styles.searchBtn}
                        onClick={() => lookupBarang(scannedBarcode)}
                        disabled={!scannedBarcode}
                    >
                        Cari
                    </button>
                </div>
            </div>
        </div>
    );
}
