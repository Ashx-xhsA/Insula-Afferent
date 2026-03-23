const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

async function request(method, path, body) {
  try {
    const options = {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_URL}${path}`, options);
    const json = await res.json();
    return json;
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export const get = (path) => request('GET', path);
export const post = (path, body) => request('POST', path, body);
