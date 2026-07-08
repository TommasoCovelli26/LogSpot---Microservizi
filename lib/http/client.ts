import { cookies } from 'next/headers';

/**
 * Funzione di utilità per recuperare gli header standard,
 * estraendo il Token JWT dai cookie di sessione se presente.
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('utente');

    if (userCookie) {
      const userData = JSON.parse(userCookie.value);
      // Se esiste il token nel cookie, lo aggiungiamo come Bearer
      if (userData.token) {
        headers['Authorization'] = `Bearer ${userData.token}`;
      }
    }
  } catch (error) {
    console.error('Errore nella lettura del token dal cookie:', error);
  }

  return headers;
}

export async function apiGet<T>(url: string): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }
  return response.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }
  // Se la risposta è 204 No Content, non facciamo il parse del JSON
  if (response.status === 204) {
    return {} as T;
  }
  
  // Alcune delete restituiscono JSON, altre nulla, usiamo un try-catch
  try {
    return await response.json();
  } catch {
    return {} as T;
  }
}