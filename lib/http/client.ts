/**
 * Client HTTP utilizzato dal Gateway per comunicare
 * con i microservizi.
 */

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }

  return response.json();
}

export async function apiPost<T>(
  url: string,
  body: unknown
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }

  return response.json();
}

export async function apiPut<T>(
  url: string,
  body: unknown
): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }

  return response.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }

  return response.json();
}