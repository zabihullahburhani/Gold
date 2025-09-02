// نویسنده: ذبیح الله برهانی
// آدرس: دانشگاه تخار، دانشکده علوم کامپیوتر.
// frontend/src/services/gold_types_api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/gold-types`;

interface GoldType {
    gold_type_id: number;
    name: string;
}

interface GoldTypeUpdate {
    name: string;
}

export async function fetchGoldTypes(token: string): Promise<GoldType[]> {
    const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error("Failed to fetch gold types");
    }
    return res.json();
}

export async function createGoldType(data: { name: string }, token: string) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error("Failed to create gold type");
    }
    return res.json();
}

export async function updateGoldType(id: number, data: GoldTypeUpdate, token: string) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        throw new Error("Failed to update gold type");
    }
    return res.json();
}

export async function deleteGoldType(id: number, token: string) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error("Failed to delete gold type");
    }
}
