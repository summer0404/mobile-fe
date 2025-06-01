import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken'; 
const REFRESH_TOKEN_KEY = 'refreshToken';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export class SessionExpiredError extends Error {
  constructor(message = "Session expired. Redirecting to sign in.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  const mergedOptions = { ...options, ...defaultOptions, headers: defaultOptions.headers };

  const response = await fetch(url, mergedOptions);

  if (response.status === 401) {
    try {
      const clonedResponse = response.clone();
      const errorData: ApiErrorResponse = await clonedResponse.json();

      if (errorData.message === "Session expired. Please log in" || errorData.error === "Session expired. Please log in") {
        console.warn("Session expired. Clearing tokens and redirecting to sign in page.");
        
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        
       
        router.replace('/auth/signIn');
        
        throw new SessionExpiredError();
      }
    } catch (e) {
      if (e instanceof SessionExpiredError) {
        throw e; 
      }
      console.warn("Received a 401 error, but not the specific 'Session expired' message, or failed to parse 401 error body:", e);
    }
  }
  return response;
}