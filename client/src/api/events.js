import { get, post } from './client';

export const getEvents = () => get('/api/events');
export const triggerEvent = (id) => post(`/api/events/${id}/trigger`);
