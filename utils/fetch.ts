import { useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

const { extra, android, version } = Constants.expoConfig || {};
const { apiUrl, env, eas, GEOAPI } = extra || {};
export const PROJECTID = eas?.projectId;
export const BASEURL = apiUrl?.[env] || 'http://192.168.0.102:3000';
export const APP_VERSION = version || '1.0.0';
export const APP_NAME = android?.package || 'com.wehostz.co-rider';
export const GOOGLE_PLAY_URL =
  android?.playStoreUrl ||
  'https://play.google.com/store/apps/details?id=com.wehostz.co-rider';
export const GEOAPIKEY = GEOAPI;
const localImagePath = `${FileSystem.documentDirectory}co-rider-profile.jpg`;
export const NAIRA = '₦';

type requestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';


export const postAPI = async (
  urlEndPoint: string,
  params?: {},
  requestMethod: requestMethod = 'POST',
  token?: string,
  timeout: number = 30000 // timeout in milliseconds (default: 10 seconds)
) => {
  const apilink = `${BASEURL}${urlEndPoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  console.log(
    'Fetching from URL:',
    apilink,
    'with params:',
    params,
    'and method:',
    requestMethod,
    'Toke',
    token,
  );

  try {
    const response = await fetch(apilink, {
      method: requestMethod,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(params && { body: JSON.stringify(params) }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId); // clear timeout on success
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error('Request timed out');
      return { error: 'Request timed out. Please try again.' };
    }

    console.error('Fetch error:', error);
    return { error: 'Unable to connect to server. Please try again later.' };
  }
};


export const AxiosPost = async (url: string, params: {}) => {
  try {
    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: params ? JSON.stringify(params) : undefined,
    });

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: 'Unable to connect to server. Please try again later.' };
  }
};

export const AxiosGet = async (url: string) => {
  try {
    const response = await fetch(`${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: 'Unable to connect to server. Please try again later.' };
  }
};

export const getAPI = async (urlEndPoint: string) => {
  const apilink = `${BASEURL}${urlEndPoint}`;
  // console.log("Fetching from URL:", apilink);
  const token = await getLocally('token');
  try {
    const response = await fetch(apilink, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }), // Add header only if token exists
      },
    });

    // if (!response.ok) {
    //   return {
    //     success: false,
    //     status: response.status,
    //     message: `Server responded with status ${response.status}`,
    //   };
    // }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: 'Unable to connect to server. Please try again later.' };
  }
};

export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: `Server responded with status ${response.status}`,
      };
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      success: false,
      message: 'Unable to connect to server. Please try again later.',
    };
  }
};

export const storeLocally = async (key: string, value: any) => {
  try {
    const serializedValue = JSON.stringify(value);
    await SecureStore.setItemAsync(key, serializedValue);
  } catch (error) {
    console.error('Error storing locally:', error);
  }
};

export const getLocally = async (key: string) => {
  try {
    const serializedValue = await SecureStore.getItemAsync(key);
    return serializedValue ? JSON.parse(serializedValue) : null;
  } catch (error) {
    console.error('Error getting locally:', error);
    return null;
  }
};

export const removeLocally = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error removing locally:', error);
  }
};

export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(url, options);
      setData(result.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
