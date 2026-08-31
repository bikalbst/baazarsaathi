const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  const { token, headers = {}, body, ...requestOptions } = options
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  let result

  try {
    result = await response.json()
  } catch {
    result = {
      success: false,
      data: null,
      message: 'The server returned an invalid response',
    }
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed')
  }

  return result
}

export { API_URL }
