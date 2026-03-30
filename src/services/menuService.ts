import api from './api';
import { MenuCategory, MenuItem } from '../types/menu.types';

export const menuService = {
  getCategories: async (): Promise<MenuCategory[]> => {
    const { data } = await api.get('/menu/categories');
    return data;
  },

  getCategoryBySlug: async (slug: string): Promise<MenuCategory> => {
    const { data } = await api.get(`/menu/categories/${slug}`);
    return data;
  },

  getCategoryGallery: async (slug: string): Promise<string[]> => {
    const { data } = await api.get(`/menu/categories/${slug}/gallery`);
    return data;
  },

  getItemsByCategory: async (slug: string): Promise<MenuItem[]> => {
    const { data } = await api.get(`/menu/categories/${slug}/items`);
    return data;
  },

  getItemById: async (id: string): Promise<MenuItem> => {
    const { data } = await api.get(`/menu/items/${id}`);
    return data;
  },

  searchItems: async (query: string): Promise<MenuItem[]> => {
    const { data } = await api.get(`/menu/search?q=${encodeURIComponent(query)}`);
    return data;
  },

  getFeaturedItems: async (): Promise<MenuItem[]> => {
    const { data } = await api.get('/menu/featured');
    return data;
  },
};
