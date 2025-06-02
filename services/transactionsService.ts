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
  console.log(
    "[transactionsService] Creating transaction at:",
    requestUrl,
    "with data:",
    transactionData
  );

  try {
    await analytics().logEvent("create_transaction", {
      transactionType: transactionData.type,
      transactionAmount: transactionData.amount,
      transactionName: transactionData.name,
    });
    const response = await authenticatedFetch(requestUrl, {
      // USE authenticatedFetch
      method: "POST",
      // headers: { 'Content-Type': 'application/json' } is handled by authenticatedFetch
      body: JSON.stringify(transactionData),
      // credentials: 'include' is handled by authenticatedFetch
    });

    const responseText = await response.text();
    console.log(
      "[transactionsService] CreateTransaction Response Status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        `[transactionsService] CreateTransaction API failed with status ${response.status}.`
      );
      // authenticatedFetch handles the specific 401 "Session expired" case.
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
      console.error(
        "[transactionsService] CreateTransaction JSON parsing failed:",
        jsonParseError
      );
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
      console.log(
        "[transactionsService] createTransaction caught SessionExpiredError, redirect initiated."
      );
      return { success: false, message: error.message, error: error.name };
    }
    console.error(
      "[transactionsService] CreateTransaction network error or other issue:",
      error
    );
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

  const requestUrl = `${API_BASE_URL}/transactions${
    queryString ? `?${queryString}` : ""
  }`;
  console.log(
    "[transactionsService] Getting all transactions from:",
    requestUrl
  );

  try {
    await analytics().logEvent("get_all_transactions");
    const response = await authenticatedFetch(requestUrl, {
      // USE authenticatedFetch
      method: "GET",
      // headers and credentials handled by authenticatedFetch
    });

    const responseText = await response.text();
    console.log(
      "[transactionsService] GetAllTransactions Response Status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        `[transactionsService] GetAllTransactions API failed with status ${response.status}.`
      );
      // authenticatedFetch handles the specific 401 "Session expired" case.
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
        console.error(
          "[transactionsService] GetAllTransactions parsed response.data is not in the expected paginated format:",
          parsedResponse.data
        );
        return {
          success: false,
          message:
            "Server response for transactions was not in the expected paginated format.",
          error: "Invalid data structure",
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    } catch (jsonParseError) {
      console.error(
        "[transactionsService] GetAllTransactions JSON parsing failed:",
        jsonParseError
      );
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
      console.log(
        "[transactionsService] getAllTransactions caught SessionExpiredError, redirect initiated."
      );
      return { success: false, message: error.message, error: error.name };
    }
    console.error(
      "[transactionsService] GetAllTransactions network error or other issue:",
      error
    );
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

  const requestUrl = `${API_BASE_URL}/transactions/expenses${
    queryString ? `?${queryString}` : ""
  }`;
  console.log(
    "[transactionsService] Getting all expense transactions from:",
    requestUrl
  );

  try {
    await analytics().logEvent("get_all_expense_transactions");
    const response = await authenticatedFetch(requestUrl, {
      // USE authenticatedFetch
      method: "GET",
      // headers and credentials handled by authenticatedFetch
    });

    const responseText = await response.text();
    console.log(
      "[transactionsService] GetAllExpenseTransactions Response Status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        `[transactionsService] GetAllExpenseTransactions API failed with status ${response.status}.`
      );
      // authenticatedFetch handles the specific 401 "Session expired" case.
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
        console.warn(
          "[transactionsService] GetAllExpenseTransactions response.data is a direct array. Wrapping in PaginatedTransactionsResponse."
        );
        return {
          success: true,
          message:
            parsedResponse.message ||
            "Expense transactions fetched successfully (as direct array in data field)",
          data: { items: parsedResponse.data as Transaction[], meta: {} },
        };
      } else if (Array.isArray(parsedResponse)) {
        console.warn(
          "[transactionsService] GetAllExpenseTransactions response is a direct array. Wrapping in PaginatedTransactionsResponse."
        );
        return {
          success: true,
          message:
            "Expense transactions fetched successfully (as direct array)",
          data: { items: parsedResponse as Transaction[], meta: {} },
        };
      } else {
        console.error(
          "[transactionsService] GetAllExpenseTransactions parsed response is not a recognized paginated format:",
          parsedResponse
        );
        return {
          success: false,
          message:
            "Server response for expense transactions was not in the expected paginated format.",
          error: "Invalid data structure",
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    } catch (jsonParseError) {
      console.error(
        "[transactionsService] GetAllExpenseTransactions JSON parsing failed:",
        jsonParseError
      );
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
      console.log(
        "[transactionsService] getAllExpenseTransactions caught SessionExpiredError, redirect initiated."
      );
      return { success: false, message: error.message, error: error.name };
    }
    console.error(
      "[transactionsService] GetAllExpenseTransactions network error or other issue:",
      error
    );
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
  console.log(
    `[transactionsService] Updating transaction ${id} at:`,
    requestUrl,
    "with data:",
    transactionData
  );

  try {
    await analytics().logEvent("update_transaction", {
      transactionId: id,
      transactionType: transactionData.type,
      transactionAmount: transactionData.amount,
      transactionName: transactionData.name,
    });
    const response = await authenticatedFetch(requestUrl, {
      // USE authenticatedFetch
      method: "PATCH",
      // headers and credentials handled by authenticatedFetch
      body: JSON.stringify(transactionData),
    });

    const responseText = await response.text();
    console.log(
      `[transactionsService] UpdateTransaction Response Status for ${id}:`,
      response.status
    );

    if (!response.ok) {
      console.error(
        `[transactionsService] UpdateTransaction API failed for ${id} with status ${response.status}.`
      );
      // authenticatedFetch handles the specific 401 "Session expired" case.
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
      console.error(
        "[transactionsService] UpdateTransaction JSON parsing failed:",
        jsonParseError
      );
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
      console.log(
        `[transactionsService] updateTransaction for ${id} caught SessionExpiredError, redirect initiated.`
      );
      return { success: false, message: error.message, error: error.name };
    }
    console.error(
      `[transactionsService] UpdateTransaction network error for ${id} or other issue:`,
      error
    );
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
  console.log(
    `[transactionsService] Deleting transaction ${id} at:`,
    requestUrl
  );

  try {
    await analytics().logEvent("delete_transaction", {
      transactionId: id,
    });
    const response = await authenticatedFetch(requestUrl, {
      // USE authenticatedFetch
      method: "DELETE",
      // headers and credentials handled by authenticatedFetch
    });

    const responseText = await response.text();
    console.log(
      `[transactionsService] DeleteTransaction Response Status for ${id}:`,
      response.status
    );

    if (!response.ok) {
      console.error(
        `[transactionsService] DeleteTransaction API failed for ${id} with status ${response.status}.`
      );
      // authenticatedFetch handles the specific 401 "Session expired" case.
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
      console.error(
        "[transactionsService] DeleteTransaction JSON parsing failed for successful response:",
        jsonParseError
      );
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
      console.log(
        `[transactionsService] deleteTransaction for ${id} caught SessionExpiredError, redirect initiated.`
      );
      return { success: false, message: error.message, error: error.name };
    }
    console.error(
      `[transactionsService] DeleteTransaction network error for ${id} or other issue:`,
      error
    );
    return {
      success: false,
      message: "A network error occurred while deleting the transaction.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
