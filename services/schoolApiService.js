import axios from 'axios';

export async function testSchoolApi(apiUrl, apiKey) {
  try {
    const url = new URL('/health', apiUrl).toString();
    const res = await axios.get(url, { headers: { 'x-api-key': apiKey } , timeout: 5000});
    return { ok: true, status: res.status, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function getStudentById(apiUrl, apiKey, studentId) {
  try {
    const url = new URL(`/students/${encodeURIComponent(studentId)}`, apiUrl).toString();
    const res = await axios.get(url, { headers: { 'x-api-key': apiKey }, timeout: 5000 });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
