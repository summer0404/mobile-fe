import { saveToAsyncStorage } from "@/utils/asyncStorage";

const API_BASE_URL = process.env.EXPO_PUBLIC_BE_URL;

import { authenticatedFetch, SessionExpiredError } from '@/utils/apiClient';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  target?: string;
  email: string;
  createdAt: string;
}

interface GetMeResponse {
  success: boolean;
  data?: UserProfile;
  message?: string;
  error?: string;
  rawErrorResponse?: string;
}

console.log("URL: ", API_BASE_URL);
export const getMe = async (): Promise<GetMeResponse> => {
  const requestUrl = `${API_BASE_URL}/auth/me`;

  try {
    // Use the authenticatedFetch wrapper
    const response = await authenticatedFetch(requestUrl, {
      method: 'GET',
      // credentials: 'include' is now handled by authenticatedFetch by default
    });

    const responseText = await response.text(); 

    if (!response.ok) {
      console.error(`[authService] getMe API failed with status ${response.status}.`);
      // The authenticatedFetch already handles the specific 401 "Session expired" case.
      // This block will handle other non-ok responses.
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message: errorData.message || `API request failed: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500),
        };
      } catch (e) {
        return {
          success: false,
          message: `API request failed: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    }

    try {
      const responseData = JSON.parse(responseText);
      if (!responseData.data) {
        console.error('[authService] getMe successful response but missing "data" field in JSON:', responseData);
        return { success: false, message: 'Successful response but missing "data" field.', error: 'Invalid data structure from server.'};
      }
      return {
        success: true,
        data: responseData.data as UserProfile,
        message: responseData.message
      };
    } catch (jsonParseError) {
      console.error('[authService] getMe JSON parsing failed even though status was ok:', jsonParseError);
      return {
        success: false,
        message: 'Failed to parse successful server response.',
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500)
      };
    }

  } catch (error) {
    if (error instanceof SessionExpiredError) {
      // The redirect is already handled by authenticatedFetch.
      // Return a response indicating failure so the UI doesn't try to process non-existent data.
      console.log('[authService] getMe caught SessionExpiredError, redirect initiated.');
      return { success: false, message: error.message, error: error.name };
    }
    // Handle other network errors or issues not caught by the above
    console.error('[authService] getMe network error or other issue:', error);
    if (error instanceof Error) {
      return { success: false, message: 'A network error occurred.', error: error.message };
    }
    return { success: false, message: 'An unexpected network error occurred.' };
  }
};

export interface LoginCredentials {
  email: string;
  password?: string;
}

interface LogInResponse {
  success: boolean;
  message?: string;
  error?: string;
  rawErrorResponse?: string;
}

export const logIn = async (credentials: LoginCredentials): Promise<LogInResponse> => {
  const requestUrl = `${API_BASE_URL}/auth/log-in`; // Corrected to use template literal and API_BASE_URL
  console.log('[authService] Attempting to log in to:', requestUrl);

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Accept': 'application/json', // Good practice to include
      },
      body: JSON.stringify(credentials), // Send credentials in the request body
      credentials: 'include', // Important for cookie-based auth (to receive and store cookies)
    });

    const responseText = await response.text(); // Get raw text first
    console.log('[authService] LogIn Response Status:', response.status);
    // console.log('[authService] LogIn Raw Response Text:', responseText.substring(0, 500));


    if (!response.ok) {
      console.error(`[authService] LogIn API failed with status ${response.status}.`);
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message: errorData.message || `Login failed: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500)
        };
      } catch (e) {
        // If parsing errorData also fails, it's likely HTML or plain text
        return {
          success: false,
          message: `Login failed: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500)
        };
      }
    }

    // If response.ok is true, try to parse the text as JSON
    // Login success often returns a simple success message or sets a cookie
    // and might not have a complex 'data' field like getMe.
    try {
      const responseData = JSON.parse(responseText);
      // Successful login typically means a session cookie is set by the server.
      // The response body might just contain a success message.
      console.log(responseData)
      await saveToAsyncStorage('userProfile', responseData?.data)
      return {
        success: true,
        message: responseData.message || "Login successful",
        // data: null, // Explicitly null as per interface
      };
    } catch (jsonParseError) {
      // If response.ok but body is not JSON (e.g. empty or plain text "OK")
      // This might still be a success if the primary indicator is the cookie being set.
      // However, APIs should ideally return consistent JSON.
      if (responseText.trim() === '' || responseText.toLowerCase().includes('ok') || responseText.toLowerCase().includes('success')) {
        console.warn('[authService] LogIn successful (status ok) but response body was not valid JSON or was empty. Assuming success based on status.');
        return { success: true, message: "Login successful (server response was not JSON)." };
      }
      console.error('[authService] LogIn JSON parsing failed even though status was ok:', jsonParseError);
      return {
        success: false,
        message: 'Failed to parse successful server response for login.',
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500)
      };
    }

  } catch (error) {
    console.error('[authService] LogIn network error or other issue:', error);
    if (error instanceof Error) {
      return { success: false, message: 'A network error occurred during login.', error: error.message };
    }
    return { success: false, message: 'An unexpected network error occurred during login.' };
  }
};



export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  email?: string; 
  target?: string;
}

interface UpdateUserResponse {
  success: boolean;
  data?: UserProfile; // API might return the updated user profile
  message?: string;
  error?: string;
  rawErrorResponse?: string;
}

export const updateUser = async (userId: number | string, userData: UpdateUserProfileData): Promise<UpdateUserResponse> => {
  const requestUrl = `${API_BASE_URL}/users/${userId}`;
  console.log(`[authService] Attempting to update user ${userId} at:`, requestUrl);
  console.log('[authService] Update data:', userData);

  try {
    const response = await fetch(requestUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // 'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include', // Important if endpoint is protected by session cookies
    });

    const responseText = await response.text();
    console.log(`[authService] UpdateUser Response Status for user ${userId}:`, response.status);

    if (!response.ok) {
      console.error(`[authService] UpdateUser API failed for user ${userId} with status ${response.status}.`);
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message: errorData.message || `Update failed: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500)
        };
      } catch (e) {
        return {
          success: false,
          message: `Update failed: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500)
        };
      }
    }

    // If response.ok is true
    try {
      const responseData = JSON.parse(responseText);
      // API might return the updated user object in responseData or responseData.data
      // Adjust based on your API's actual response structure
      const updatedUser = responseData.data || responseData;

      return {
        success: true,
        message: responseData.message || "User updated successfully",
        data: updatedUser as UserProfile, // Assuming the response (or response.data) is the updated UserProfile
      };
    } catch (jsonParseError) {
      // Handle cases where response is OK but not JSON (e.g., 204 No Content)
      if (response.status === 204) { // 204 No Content is a success but has no body
        console.log(`[authService] User ${userId} updated successfully (204 No Content).`);
        return { success: true, message: "User updated successfully (No Content)" };
      }
      if (responseText.trim() === '' || responseText.toLowerCase().includes('ok') || responseText.toLowerCase().includes('success')) {
        console.warn('[authService] UpdateUser successful (status ok) but response body was not valid JSON or was empty. Assuming success based on status.');
        return { success: true, message: "User updated successfully (server response was not JSON)." };
      }
      console.error('[authService] UpdateUser JSON parsing failed even though status was ok:', jsonParseError);
      return {
        success: false,
        message: 'Failed to parse successful server response for user update.',
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500)
      };
    }

  } catch (error) {
    console.error(`[authService] UpdateUser network error or other issue for user ${userId}:`, error);
    if (error instanceof Error) {
      return { success: false, message: 'A network error occurred during user update.', error: error.message };
    }
    return { success: false, message: 'An unexpected network error occurred during user update.' };
  }
};


interface LogOutResponse {
  success: boolean;
  message?: string;
  error?: string;
  rawErrorResponse?: string;
}

export const logOut = async (): Promise<LogOutResponse> => {
  const requestUrl = `${API_BASE_URL}/auth/log-out`;
  console.log('[authService] Attempting to log out from:', requestUrl);

  try {
    const response = await fetch(requestUrl, {
      method: 'GEt',
      headers: {
        'Content-Type': 'application/json', // Content-Type might not be strictly necessary if no body is sent
      },
      credentials: 'include', // Important to send cookies so the server can invalidate the session
      // body: JSON.stringify({}), // Logout usually doesn't require a body, but some APIs might expect an empty JSON object
    });

    const responseText = await response.text();
    console.log('[authService] LogOut Response Status:', response.status);
    // console.log('[authService] LogOut Raw Response Text:', responseText.substring(0, 500));

    if (!response.ok) {
      console.error(`[authService] LogOut API failed with status ${response.status}.`);
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message: errorData.message || `Logout failed: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500)
        };
      } catch (e) {
        return {
          success: false,
          message: `Logout failed: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500)
        };
      }
    }

    // If response.ok is true
    // Logout success often means the session cookie is cleared by the server.
    // The response body might be empty or contain a simple success message.
    try {
      // If responseText is empty, JSON.parse will throw.
      // A 204 No Content is a common successful response for logout.
      if (response.status === 204 || responseText.trim() === '') {
        console.log('[authService] Logout successful (204 No Content or empty response).');
        return { success: true, message: "Logout successful" };
      }

      const responseData = JSON.parse(responseText);
      return {
        success: true,
        message: responseData.message || "Logout successful",
      };
    } catch (jsonParseError) {
      // If response.ok but body is not JSON (e.g. plain text "OK")
      if (responseText.toLowerCase().includes('ok') || responseText.toLowerCase().includes('success')) {
        console.warn('[authService] LogOut successful (status ok) but response body was not valid JSON. Assuming success based on status and text.');
        return { success: true, message: "Logout successful (server response was not JSON)." };
      }
      console.error('[authService] LogOut JSON parsing failed even though status was ok:', jsonParseError);
      return {
        success: false,
        message: 'Failed to parse successful server response for logout.',
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500)
      };
    }

  } catch (error) {
    console.error('[authService] LogOut network error or other issue:', error);
    if (error instanceof Error) {
      return { success: false, message: 'A network error occurred during logout.', error: error.message };
    }
    return { success: false, message: 'An unexpected network error occurred during logout.' };
  }
};

export interface ChangePasswordData {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
  rawErrorResponse?: string;
}

export const changePassword = async (passwordData: ChangePasswordData): Promise<ChangePasswordResponse> => {
  const requestUrl = `${API_BASE_URL}/auth/change-password`;
  console.log('[authService] Attempting to change password at:', requestUrl);

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
      credentials: 'include', // Important if endpoint is protected by session cookies
    });

    const responseText = await response.text();
    console.log('[authService] ChangePassword Response Status:', response.status);
    // console.log('[authService] ChangePassword Raw Response Text:', responseText.substring(0, 500));

    if (!response.ok) {
      console.error(`[authService] ChangePassword API failed with status ${response.status}.`);
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message: errorData.message || `Password change failed: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500)
        };
      } catch (e) {
        return {
          success: false,
          message: `Password change failed: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500)
        };
      }
    }

    // If response.ok is true
    try {
      // A 204 No Content is a common successful response for actions like password change.
      if (response.status === 204 || responseText.trim() === '') {
        console.log('[authService] Password changed successfully (204 No Content or empty response).');
        return { success: true, message: "Password changed successfully" };
      }

      const responseData = JSON.parse(responseText);
      return {
        success: true,
        message: responseData.message || "Password changed successfully",
      };
    } catch (jsonParseError) {
      if (responseText.toLowerCase().includes('ok') || responseText.toLowerCase().includes('success')) {
        console.warn('[authService] ChangePassword successful (status ok) but response body was not valid JSON. Assuming success based on status and text.');
        return { success: true, message: "Password changed successfully (server response was not JSON)." };
      }
      console.error('[authService] ChangePassword JSON parsing failed even though status was ok:', jsonParseError);
      return {
        success: false,
        message: 'Failed to parse successful server response for password change.',
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500)
      };
    }

  } catch (error) {
    console.error('[authService] ChangePassword network error or other issue:', error);
    if (error instanceof Error) {
      return { success: false, message: 'A network error occurred during password change.', error: error.message };
    }
    return { success: false, message: 'An unexpected network error occurred during password change.' };
  }
};

export interface RefreshTokenData {
  accessToken: string;
  refreshToken?: string; // Optional: some APIs might return a new refresh token
}

interface RefreshTokenResponse {
  success: boolean;
  data?: RefreshTokenData; // This is where app/index.tsx expects accessToken
  message?: string;
  error?: string;
  rawErrorResponse?: string;
}

export const refreshToken = async (storedRefreshToken: string): Promise<RefreshTokenResponse> => {
  const requestUrl = `${API_BASE_URL}/auth/refresh`;
  console.log('[authService] Attempting to refresh token from:', requestUrl);

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Pass the storedRefreshToken if your API expects it in headers/body.
      // If it's an HttpOnly cookie managed by the browser/OS, 'credentials: include' is key.
      // Example if sending as Bearer token (less common for refresh tokens):
      // headers: { 'Authorization': `Bearer ${storedRefreshToken}` },
      credentials: 'include',
    });

    const responseText = await response.text();
    console.log('[authService] RefreshToken Response Status:', response.status);

    if (!response.ok) {
      console.error(`[authService] RefreshToken API failed with status ${response.status}.`);
      try {
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message: errorData.message || `Token refresh failed: ${response.status}`,
          error: errorData.error || errorData.message,
          rawErrorResponse: responseText.substring(0, 500),
        };
      } catch (e) {
        return {
          success: false,
          message: `Token refresh failed: ${response.status}. Server returned non-JSON response.`,
          error: `Received non-JSON response. Status: ${response.status}`,
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    }

    // If response.ok is true
    try {
      const responseData = JSON.parse(responseText); // e.g. { message: "Success", data: null }

      // Case 1: API provides new tokens in responseData.data
      if (responseData.data && responseData.data.accessToken) {
        return {
          success: true,
          message: responseData.message || "Token refreshed successfully",
          data: responseData.data as RefreshTokenData,
        };
      }
      // Case 2: API call is successful (e.g. 200 OK), message indicates success, but data is explicitly null
      // This implies HttpOnly cookies might have been updated, but no tokens in body.
      else if (responseData.message && responseData.data === null) {
        console.log('[authService] RefreshToken HTTP call successful (data: null), but no new tokens in response body.');
        return {
          success: true, // The HTTP call itself was successful
          message: responseData.message,
          data: undefined, // Explicitly indicate no token data from body for AsyncStorage
        };
      }
      // Case 3: Response is OK, but structure is not as expected for tokens.
      else {
        console.error('[authService] RefreshToken successful HTTP response but missing accessToken or unexpected data structure:', responseData);
        return {
          success: false, // Treat as failure to obtain new token from body
          message: 'Token refresh response missing accessToken in body or unexpected structure.',
          error: 'Invalid data structure from server for token data.',
          rawErrorResponse: responseText.substring(0, 500),
        };
      }
    } catch (jsonParseError) {
      console.error('[authService] RefreshToken JSON parsing failed even though status was ok:', jsonParseError);
      return {
        success: false,
        message: 'Failed to parse successful server response for token refresh.',
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0, 500),
      };
    }
  } catch (error) {
    console.error('[authService] RefreshToken network error or other issue:', error);
    if (error instanceof Error) {
      return { success: false, message: 'A network error occurred during token refresh.', error: error.message };
    }
    return { success: false, message: 'An unexpected network error occurred during token refresh.' };
  }
};