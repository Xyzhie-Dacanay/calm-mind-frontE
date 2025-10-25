// src/api/coach.js
import client from './client'; // your existing Axios instance

export const getCoachContext = async (user_id) => {
  try {
    const res = await client.get('/coach/context', { params: { user_id } });
    return res.data;
  } catch (err) {
    console.error('Error fetching coach context:', err);
    throw err;
  }
};

export const sendCoachMessage = async (user_id, message) => {
  try {
    const res = await client.post('/coach/chat', { user_id, message });
    return res.data;
  } catch (err) {
    console.error('Error sending coach message:', err);
    throw err;
  }
};
