
const API_BASE_URL = process.env.BE_URL || 'http://localhost:3010/api/v1'; // Fallback

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

export const getMe = async (): Promise<GetMeResponse> => {
  const requestUrl = `${API_BASE_URL}/auth/me`;
  console.log('[authService] Attempting to fetch user profile from:', requestUrl);

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const responseText = await response.text(); // Get raw text first

  
    if (!response.ok) {
      console.error(`[authService] API failed with status ${response.status}.`);
      // try {
      //   const errorData = JSON.parse(responseText); // Try to parse if it's a JSON error
      //   return {
      //     success: false,
      //     message: errorData.message || `Error: ${response.status}`,
      //     error: errorData.error || errorData.message,
      //     rawErrorResponse: responseText.substring(0,500)
      //   };
      // } catch (e) {
      //   return {
      //     success: false,
      //     message: `Server error: ${response.status}. Response is not valid JSON.`,
      //     error: `Received non-JSON response. Status: ${response.status}`,
      //     rawErrorResponse: responseText.substring(0,500)
      //   };
      // }
    }

    try {
      const responseData = JSON.parse(responseText);
      if (!responseData.data) { // Check if the expected 'data' field exists
        console.error('[authService] Successful response but missing "data" field in JSON:', responseData);
        return { success: false, message: 'Successful response but missing "data" field.', error: 'Invalid data structure from server.'};
      }
      return {
        success: true,
        data: responseData.data as UserProfile,
        message: responseData.message
      };
    } catch (jsonParseError) {
      console.error('[authService] JSON parsing failed even though status was ok:', jsonParseError);
      return {
        success: false,
        message: 'Failed to parse successful server response.',
        error: (jsonParseError as Error).message,
        rawErrorResponse: responseText.substring(0,500)
      };
    }

  } catch (error) {
    console.error('[authService] Network error or other issue:', error);
    if (error instanceof Error) {
      return { success: false, message: 'A network error occurred.', error: error.message };
    }
    return { success: false, message: 'An unexpected network error occurred.' };
  }
};