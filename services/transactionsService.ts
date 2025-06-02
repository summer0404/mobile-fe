import { authenticatedFetch, SessionExpiredError } from "@/utils/apiClient"; // Adjust path if needed
import analytics from "@react-native-firebase/analytics";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BE_URL || "http://localhost:3010/api/v1"; // Fallback

export type TransactionType =
  | "income"
  | "education"
  | "food"
  | "transport"
  | "groceries"
  | "shopping"
  | "entertainment"
  | "beauty"
  | "health"
  | "vacation"
  | "bill"
  | "home"
  | "borrow"
  | "lend"
  | "other";

export interface Transaction {
  id: number | string;
  name: string;
  type: TransactionType;
  amount: number;
  detail?: string | null;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionData {
  name: string;
  type: TransactionType;
  amount: number;
  detail?: string | null;
  date: string;
}

export interface UpdateTransactionData {
  name?: string;
  type?: TransactionType;
  amount?: number;
  detail?: string | null;
  date?: string;
}

// Define the structure for paginated transaction data
export interface PaginatedTransactionsResponse {
  items: Transaction[];
  meta: {
    totalItems?: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  rawErrorResponse?: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
}

// --- Service Functions ---

/**
 * 1. Create Transaction
 * POST /api/v1/transactions
 */
export const createTransaction = async (
  transactionData: CreateTransactionData
): Promise<ApiResponse<Transaction>> => {
  const requestUrl = `${API_BASE_URL}/transactions`;

  try {
    await analytics().logEvent("create_transaction", {
      transactionType: transactionData.type,
      transactionAmount: transactionData.amount,
      transactionName: transactionData.name,
    });
    const response = await authenticatedFetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message:
            errorData.message ||
            `Failed to create transaction: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500),
        };
      } catch (e) {
        return {
          success: false,
          message: `Failed to create transaction: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    }

    try {
      const responseData = JSON.parse(responseText);
      return {
        success: true,
        message: responseData.message || "Transaction created successfully",
        data: responseData.data || responseData,
      };
    } catch (jsonParseError) {
      return {
        success: false,
        message:
          "Failed to parse successful server response for create transaction.",
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500),
      };
    }
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return { success: false, message: error.message, error: error.name };
    }
    return {
      success: false,
      message: "A network error occurred while creating the transaction.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * 2. Get All Transactions
 * GET /api/v1/transactions
 */
export interface GetAllTransactionsParams {
  page?: number;
  limit?: number;
  id?: number;
  name?: string;
  type?: TransactionType | string;
  amount?: number;
  detail?: string;
  sort?: string;
  createFrom?: string;
  createTo?: string;
}

export const getAllTransactions = async (
  params?: GetAllTransactionsParams
): Promise<ApiResponse<PaginatedTransactionsResponse>> => {
  let queryString = "";
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    queryString = queryParams.toString();
  }

  const requestUrl = `${API_BASE_URL}/transactions${queryString ? `?${queryString}` : ''}`;

  try {
    await analytics().logEvent("get_all_transactions");
    const response = await authenticatedFetch(requestUrl, {
      method: 'GET',
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message:
            errorData.message ||
            `Failed to fetch transactions: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500),
        };
      } catch (e) {
        return {
          success: false,
          message: `Failed to fetch transactions: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    }

    try {
      const parsedResponse = JSON.parse(responseText);

      if (
        parsedResponse.data &&
        Array.isArray(parsedResponse.data.items) &&
        parsedResponse.data.meta
      ) {
        return {
          success: true,
          message:
            parsedResponse.message || "Transactions fetched successfully",
          data: parsedResponse.data,
          currentPage: parsedResponse.data.meta.currentPage,
          totalPages: parsedResponse.data.meta.totalPages,
          totalItems: parsedResponse.data.meta.totalItems,
        };
      } else if (Array.isArray(parsedResponse)) {
        return {
          success: true,
          message: "Transactions fetched successfully (as direct array)",
          data: { items: parsedResponse, meta: {} },
        };
      } else {
        return {
          success: false,
          message:
            "Server response for transactions was not in the expected paginated format.",
          error: "Invalid data structure",
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    } catch (jsonParseError) {
      return {
        success: false,
        message:
          "Failed to parse successful server response for get all transactions.",
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500),
      };
    }
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return { success: false, message: error.message, error: error.name };
    }
    return {
      success: false,
      message: "A network error occurred while fetching transactions.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Get All Expense Transactions (Now with Params and Pagination)
 * GET /api/v1/transactions/expenses
 */
export const getAllExpenseTransactions = async (
  params?: GetAllTransactionsParams
): Promise<ApiResponse<PaginatedTransactionsResponse>> => {
  let queryString = "";
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    queryString = queryParams.toString();
  }

  const requestUrl = `${API_BASE_URL}/transactions/expenses${queryString ? `?${queryString}` : ''}`;

  try {
    await analytics().logEvent("get_all_expense_transactions");
    const response = await authenticatedFetch(requestUrl, {
      method: 'GET',
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message:
            errorData.message ||
            `Failed to fetch expense transactions: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500),
        };
      } catch (e) {
        return {
          success: false,
          message: `Failed to fetch expense transactions: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    }

    try {
      const parsedResponse = JSON.parse(responseText);

      if (
        parsedResponse.data &&
        Array.isArray(parsedResponse.data.items) &&
        parsedResponse.data.meta
      ) {
        return {
          success: true,
          message:
            parsedResponse.message ||
            "Expense transactions fetched successfully",
          data: parsedResponse.data,
          currentPage: parsedResponse.data.meta.currentPage,
          totalPages: parsedResponse.data.meta.totalPages,
          totalItems: parsedResponse.data.meta.totalItems,
        };
      } else if (Array.isArray(parsedResponse.data)) {
        return {
          success: true,
          message:
            parsedResponse.message ||
            "Expense transactions fetched successfully (as direct array in data field)",
          data: { items: parsedResponse.data as Transaction[], meta: {} },
        };
      } else if (Array.isArray(parsedResponse)) {
        return {
          success: true,
          message:
            "Expense transactions fetched successfully (as direct array)",
          data: { items: parsedResponse as Transaction[], meta: {} },
        };
      }
      else {
        return {
          success: false,
          message:
            "Server response for expense transactions was not in the expected paginated format.",
          error: "Invalid data structure",
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    } catch (jsonParseError) {
      return {
        success: false,
        message:
          "Failed to parse successful server response for get all expense transactions.",
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500),
      };
    }
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return { success: false, message: error.message, error: error.name };
    }
    return {
      success: false,
      message: "A network error occurred while fetching expense transactions.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * 3. Update Transaction
 * PATCH /api/v1/transactions/{id}
 */
export const updateTransaction = async (
  id: number | string,
  transactionData: UpdateTransactionData
): Promise<ApiResponse<Transaction>> => {
  const requestUrl = `${API_BASE_URL}/transactions/${id}`;

  try {
    await analytics().logEvent("update_transaction", {
      transactionId: id,
      transactionType: transactionData.type,
      transactionAmount: transactionData.amount,
      transactionName: transactionData.name,
    });
    const response = await authenticatedFetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(transactionData),
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message:
            errorData.message ||
            `Failed to update transaction: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500),
        };
      } catch (e) {
        return {
          success: false,
          message: `Failed to update transaction: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    }

    try {
      const responseData = JSON.parse(responseText);
      return {
        success: true,
        message: responseData.message || "Transaction updated successfully",
        data: responseData.data || responseData,
      };
    } catch (jsonParseError) {
      return {
        success: false,
        message:
          "Failed to parse successful server response for update transaction.",
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500),
      };
    }
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return { success: false, message: error.message, error: error.name };
    }
    return {
      success: false,
      message: "A network error occurred while updating the transaction.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * 4. Delete Transaction
 * DELETE /api/v1/transactions/{id}
 */
export const deleteTransaction = async (
  id: number | string
): Promise<ApiResponse<null>> => {
  const requestUrl = `${API_BASE_URL}/transactions/${id}`;

  try {
    await analytics().logEvent("delete_transaction", {
      transactionId: id,
    });
    const response = await authenticatedFetch(requestUrl, {
      method: 'DELETE',
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message:
            errorData.message ||
            `Failed to delete transaction: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500),
        };
      } catch (e) {
        return {
          success: false,
          message: `Failed to delete transaction: ${response.status}. Server returned non-JSON error.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    }

    if (response.status === 204 || responseText.trim() === "") {
      return {
        success: true,
        message: "Transaction deleted successfully",
        data: null,
      };
    }

    try {
      const responseData = JSON.parse(responseText);
      return {
        success: true,
        message: responseData.message || "Transaction deleted successfully",
        data: null,
      };
    } catch (jsonParseError) {
      if (
        responseText.toLowerCase().includes("ok") ||
        responseText.toLowerCase().includes("success")
      ) {
        return {
          success: true,
          message:
            "Transaction deleted successfully (server response was not JSON).",
        };
      }
      return {
        success: false,
        message:
          "Failed to parse successful server response for delete transaction.",
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500),
      };
    }
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return { success: false, message: error.message, error: error.name };
    }
    return {
      success: false,
      message: "A network error occurred while deleting the transaction.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
