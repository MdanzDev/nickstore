import { useState, useEffect, useCallback } from 'react';
import { gamesCollection, storageHelpers } from '@/lib/mongodb';
import { useAuth } from '@/contexts/AuthContext';
import type { Game } from '@/types';

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gamesCollection.list();
      
      const gamesWithImages = await Promise.all(
        response.documents.map(async (doc: any) => {
          const game = doc as unknown as Game;
          if (game.image_id) {
            try {
              // getFilePreview now only takes fileId
              game.image_url = storageHelpers.getFilePreview(game.image_id);
            } catch (e) {
              console.error('Error loading image:', e);
            }
          }
          return game;
        })
      );
      
      setGames(gamesWithImages.filter(g => g.is_active));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const getGame = useCallback(async (gameId: string) => {
    try {
      const doc = await gamesCollection.get(gameId);
      const game = doc as unknown as Game;
      if (game.image_id) {
        game.image_url = storageHelpers.getFilePreview(game.image_id);
      }
      return game;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch game');
    }
  }, []);

  return { games, loading, error, refresh: fetchGames, getGame };
};

export const useAdminGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchGames = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in to view games');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await gamesCollection.list();
      
      const gamesWithImages = await Promise.all(
        response.documents.map(async (doc: any) => {
          const game = doc as unknown as Game;
          if (game.image_id) {
            try {
              // getFilePreview now only takes fileId
              game.image_url = storageHelpers.getFilePreview(game.image_id);
            } catch (e) {
              console.error('Error loading image:', e);
            }
          }
          return game;
        })
      );
      
      setGames(gamesWithImages);
      setError(null);
    } catch (err: any) {
      console.error('Fetch games error:', err);
      setError(err.message || 'Failed to fetch games');
      if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
        setGames([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createGame = useCallback(async (data: { name: string; description: string; is_active: boolean }, imageFile?: File) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to create a game');
    }

    try {
      setLoading(true);
      let image_id = '';
      
      if (imageFile) {
        try {
          const upload = await storageHelpers.uploadFile(imageFile, 'game');
          image_id = upload.$id;
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
      }
      
      const gameData = {
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        image_id,
      };
      
      const newGame = await gamesCollection.create(gameData);
      await fetchGames();
      
      return newGame;
    } catch (err: any) {
      console.error('Create game error:', err);
      throw new Error(err.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchGames]);

  const updateGame = useCallback(async (gameId: string, data: Partial<Game>, imageFile?: File) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to update a game');
    }

    try {
      setLoading(true);
      let image_id = data.image_id;
      
      if (imageFile) {
        try {
          const upload = await storageHelpers.uploadFile(imageFile, 'game');
          image_id = upload.$id;
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
      }
      
      const updateData: any = {
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        image_id,
      };
      
      const updated = await gamesCollection.update(gameId, updateData);
      await fetchGames();
      
      return updated;
    } catch (err: any) {
      console.error('Update game error:', err);
      throw new Error(err.message || 'Failed to update game');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchGames]);

  const deleteGame = useCallback(async (gameId: string) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to delete a game');
    }

    try {
      setLoading(true);
      await gamesCollection.delete(gameId);
      await fetchGames();
    } catch (err: any) {
      console.error('Delete game error:', err);
      throw new Error(err.message || 'Failed to delete game');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchGames]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { 
    games, 
    loading, 
    error, 
    refresh: fetchGames, 
    createGame, 
    updateGame, 
    deleteGame 
  };
};
