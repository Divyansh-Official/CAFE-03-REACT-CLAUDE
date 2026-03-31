import api from './api';

export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  permalink: string;
  timestamp: string;
  likes?: number;
}

export const socialService = {
  getInstagramFeed: async (): Promise<InstagramPost[]> => {
    const { data } = await api.get('/social/instagram-feed');
    return data;
  },
};