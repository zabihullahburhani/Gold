// آدرس پایه API
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/gold-analysis`;

// --- واسط‌های داده ---
export interface GoldAnalysis {
  id: number;
  gross_weight: number;
  initial_purity: number;
  tola_rate: number;
  final_weight: number;
  usd_rate: number;
  analysis_date: string;
  created_at?: string; // اختیاری، هماهنگ با جدول
}

export type CreateGoldAnalysisData = Pick<GoldAnalysis, "gross_weight" | "initial_purity" | "tola_rate">;

/**
 * 📊 واکشی داده‌های تحلیل طلا
 * @param token توکن احراز هویت
 * @returns آرایه‌ای از تحلیل‌های طلا
 */
export async function fetchGoldAnalysis(token: string): Promise<GoldAnalysis[]> {
  try {
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`خطای HTTP در واکشی داده‌ها: ${response.status}`);
    }
    const result = await response.json();
    console.log("API response:", result); // لاگ برای دیباگ
    return result || [];
  } catch (error) {
    console.error("خطا در واکشی تحلیل طلا:", error);
    throw error;
  }
}

/**
 * ➕ ایجاد یک تحلیل جدید
 * @param token توکن احراز هویت
 * @param data شامل وزن، عیار و نرخ توله
 * @returns رکورد جدید یا null در صورت خطا
 */
export async function createGoldAnalysis(token: string, data: CreateGoldAnalysisData): Promise<GoldAnalysis | null> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("API Error creating analysis:", result.error);
      throw new Error(result.error || "خطا در ثبت تحلیل");
    }

    return result as GoldAnalysis;
  } catch (error) {
    console.error("خطا در ایجاد تحلیل طلا:", error);
    return null;
  }
}

/**
 * 🗑️ حذف یک تحلیل
 * @param token توکن احراز هویت
 * @param id شناسه رکورد مورد نظر
 * @returns موفقیت‌آمیز بودن عملیات
 */
export async function deleteGoldAnalysis(token: string, id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("API Error deleting analysis:", errorBody.error);
      throw new Error(errorBody.error || `خطا در حذف رکورد ${id}`);
    }

    console.log(`Analysis ID ${id} deleted successfully.`);
    return true;
  } catch (error) {
    console.error("خطا در حذف تحلیل طلا:", error);
    return false;
  }
}