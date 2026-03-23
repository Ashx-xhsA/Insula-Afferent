import { get, post } from './client';

export const getStats = () => get('/api/stats');
export const restoreStat = (id) => post(`/api/stats/${id}/restore`);
