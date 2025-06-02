// controller/DebtController.ts
import { ToastAndroid } from "react-native";
import { apiRequest } from "@/utils/commonUtil";
import { TransactionType, TransactionStatus } from "@/constants/enum";
import analytics from "@react-native-firebase/analytics";
const URL_BACKEND = process.env.EXPO_PUBLIC_BE_URL;
export interface DebtFormData {
  name: string;
  type: TransactionType;
  amount: number;
  debtorName: string;
  detail: string;
  date: string;
  dueDate: string | null;
  status: TransactionStatus;
}

/**
 * Gửi yêu cầu tạo mới một khoản nợ
 */
export const handleAddDebt = async (
  form: DebtFormData,
  onSuccess: () => void,
  onError?: (err: any) => void
) => {
  try {
    await analytics().logEvent("add_debt");
    const response = await apiRequest(`${URL_BACKEND}/debts`, "POST", form);
    console.log("Add response:", response);
    // ToastAndroid.show('Debt added successfully!', ToastAndroid.SHORT);
    onSuccess();
  } catch (err) {
    console.error("Error adding debt:", err);
    // ToastAndroid.show('Failed to add debt', ToastAndroid.SHORT);
    onError?.(err);
  }
};

/**
 * Lấy chi tiết một khoản nợ theo ID (áp dụng cho API GET /debts?id=...)
 */
export const handleGetDebt = (id: string | string[] | number) => {
  return (async () => {
    try {
      await analytics().logEvent("get_debt", { id });
      const safeId = Array.isArray(id) ? id[0] : id;
      const response = await fetch(`${URL_BACKEND}/debts?id=${safeId}`);
      const listDebts = (await response.json()).data?.items;
      if (!Array.isArray(listDebts) || listDebts.length === 0) {
        throw new Error("Debt not found");
      }
      return {
        name: listDebts[0].transaction?.name,
        type: listDebts[0]?.transaction?.type,
        amount: listDebts[0]?.transaction?.amount,
        debtorName: listDebts[0]?.debtorName,
        detail: listDebts[0]?.transaction?.detail,
        date: listDebts[0]?.transaction?.date,
        dueDate: listDebts[0]?.dueDate,
        status: listDebts[0]?.status,
      };
    } catch (error) {
      console.error("Error fetching debt:", error);
      throw error;
    }
  })();
};

/**
 * Xóa một khoản nợ theo ID
 */
export const handleDeleteDebt = async (
  id: string | string[] | number,
  onSuccess: () => void,
  onError?: (err: any) => void
) => {
  try {
    await analytics().logEvent("delete_debt", { id });
    const safeId = Array.isArray(id) ? id[0] : id;
    const res = await fetch(`${URL_BACKEND}/debts/${safeId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      ToastAndroid.show("Debt deleted successfully", ToastAndroid.SHORT);
      onSuccess();
    } else {
      throw new Error("Failed to delete debt");
    }
  } catch (err) {
    console.error("Error deleting debt:", err);
    ToastAndroid.show("Failed to delete debt", ToastAndroid.SHORT);
    onError?.(err);
  }
};

/**
 * Cập nhật lại danh sách nợ nếu cần (có thể dùng thêm nếu cần reload list ở nơi khác)
 */
export const handleFetchDebts = async (query: Record<string, any> = {}) => {
  try {
    await analytics().logEvent("fetch_debts", { query });
    const searchParams = new URLSearchParams(query).toString();
    const res = await fetch(`${URL_BACKEND}/debts?${searchParams}`);
    const data = (await res.json()).data;
    return data;
  } catch (err) {
    console.error("Error fetching debts:", err);
    throw err;
  }
};

/**
 * Gửi yêu cầu thay đổi thông tin một khoản nợ theo ID
 */
export const handleUpdateDebt = async (
  id: string | string[] | number,
  form: DebtFormData,
  onSuccess: () => void,
  onError?: (err: any) => void
) => {
  try {
    await analytics().logEvent("update_debt", { id, form });
    const safeId = Array.isArray(id) ? id[0] : id;
    console.log("Fomr update debt", form);
    const response = await apiRequest(
      `${URL_BACKEND}/debts/${safeId}`,
      "PATCH",
      form
    );
    console.log("Update response:", response);
    // ToastAndroid.show('Debt updated successfully!', ToastAndroid.SHORT);
    onSuccess();
  } catch (err) {
    console.error("Error updating debt:", err);
    // ToastAndroid.show('Failed to update debt', ToastAndroid.SHORT);
    onError?.(err);
  }
};
