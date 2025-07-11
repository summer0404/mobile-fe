export async function apiRequest<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any
): Promise<T> {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${error}`);
    }

    return response.json();
}
