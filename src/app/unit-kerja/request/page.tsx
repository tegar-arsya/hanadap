"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./request.module.css";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
}

interface RequestItem {
    barangId: string;
    jumlahDiminta: number;
}

export default function UnitKerjaRequestPage() {
    const router = useRouter();
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState<RequestItem[]>([]);
    const [catatan, setCatatan] = useState("");

    useEffect(() => {
        const fetchBarang = async () => {
            try {
                const res = await fetch("/api/barang");
                const data = await res.json();
                setBarangList(data);
            } catch (error) {
                console.error("Error fetching barang:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBarang();
    }, []);

    const handleAddItem = () => {
        if (barangList.length > 0) {
            setItems([...items, { barangId: barangList[0].id, jumlahDiminta: 1 }]);
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (
        index: number,
        field: keyof RequestItem,
        value: string | number
    ) => {
        const newItems = [...items];
        if (field === "barangId") {
            newItems[index].barangId = value as string;
        } else {
            newItems[index].jumlahDiminta = parseInt(value as string) || 1;
        }
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            alert("Tambahkan minimal 1 item");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, catatan }),
            });

            if (res.ok) {
                router.push("/unit-kerja/tracking");
            } else {
                const error = await res.json();
                alert(error.error || "Gagal membuat request");
            }
        } catch (error) {
            console.error("Error creating request:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Memuat data...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Ajukan Permintaan</h1>
            <p className={styles.subtitle}>Buat permintaan barang baru</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.itemsSection}>
                    <div className={styles.itemsHeader}>
                        <h3>Daftar Barang</h3>
                        <button
                            type="button"
                            className={styles.addItemBtn}
                            onClick={handleAddItem}
                        >
                            + Tambah Item
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className={styles.emptyItems}>
                            Klik &quot;Tambah Item&quot; untuk menambahkan barang
                        </div>
                    ) : (
                        <div className={styles.itemsList}>
                            {items.map((item, index) => {
                                const selectedBarang = barangList.find(
                                    (b) => b.id === item.barangId
                                );
                                return (
                                    <div key={index} className={styles.itemRow}>
                                        <select
                                            value={item.barangId}
                                            onChange={(e) =>
                                                handleItemChange(index, "barangId", e.target.value)
                                            }
                                            className={styles.select}
                                        >
                                            {barangList.map((barang) => (
                                                <option key={barang.id} value={barang.id}>
                                                    {barang.nama} (Stok: {barang.stokTotal} {barang.satuan})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.jumlahDiminta}
                                            onChange={(e) =>
                                                handleItemChange(index, "jumlahDiminta", e.target.value)
                                            }
                                            className={styles.qtyInput}
                                        />
                                        <span className={styles.satuan}>
                                            {selectedBarang?.satuan}
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.removeBtn}
                                            onClick={() => handleRemoveItem(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={styles.noteSection}>
                    <label className={styles.label}>Catatan (opsional)</label>
                    <textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        className={styles.textarea}
                        placeholder="Tambahkan catatan jika diperlukan..."
                        rows={3}
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting || items.length === 0}
                >
                    {submitting ? "Mengirim..." : "Kirim Permintaan"}
                </button>
            </form>
        </div>
    );
}
