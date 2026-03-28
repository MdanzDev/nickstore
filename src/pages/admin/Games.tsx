import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Upload, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAdminGames } from '@/hooks/useGames';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Game } from '@/types';

const Games: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { games, loading, createGame, updateGame, deleteGame } = useAdminGames();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsSearching(true);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setSearchQuery(value);
      setIsSearching(false);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const filteredGames = useMemo(() => {
    return games.filter((game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [games, searchQuery]);

  const handleOpenModal = (game?: Game) => {
    console.log('Opening modal', game);
    if (game) {
      setEditingGame(game);
      setFormData({
        name: game.name,
        description: game.description,
        is_active: game.is_active,
      });
      setImagePreview(game.image_url || '');
    } else {
      setEditingGame(null);
      setFormData({ name: '', description: '', is_active: true });
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingGame) {
        await updateGame(editingGame.$id!, formData, imageFile || undefined);
      } else {
        await createGame(formData, imageFile || undefined);
      }
      setIsModalOpen(false);
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      console.error('Error saving game:', err);
      alert(err instanceof Error ? err.message : 'Failed to save game');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (gameToDelete) {
      try {
        await deleteGame(gameToDelete.$id!);
        setDeleteConfirmOpen(false);
        setGameToDelete(null);
      } catch (err) {
        console.error('Error deleting game:', err);
        alert(err instanceof Error ? err.message : 'Failed to delete game');
      }
    }
  };

  const confirmDelete = (game: Game) => {
    setGameToDelete(game);
    setDeleteConfirmOpen(true);
  };

  const handleImageError = (gameId: string) => {
    setImageError(prev => ({ ...prev, [gameId]: true }));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminSidebar />

      <main className="lg:ml-64 min-h-screen">
        <div className="h-16 lg:hidden" />

        <div className="p-6">
          {/* Header with animations */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-up">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center animate-pulse-slow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Games</h1>
              </div>
              <p className="text-slate-400">Manage your game catalog</p>
            </div>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white transition-all duration-300 hover:scale-105 group"
            >
              <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" />
              Add Game
            </Button>
          </div>

          {/* Search with animation */}
          <div className="relative mb-8 animate-fade-in-up animation-delay-100">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-all duration-300" />
            <Input
              placeholder="Search games..."
              onChange={handleSearchChange}
              className="pl-12 py-6 bg-slate-900/50 border-slate-700 text-white text-lg rounded-xl transition-all duration-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Stats Badge */}
          {!loading && filteredGames.length > 0 && (
            <div className="mb-4 text-sm text-slate-500 animate-fade-in-up animation-delay-200">
              Found {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Games Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20 animate-fade-in-up">
              <div className="relative">
                <LoadingSpinner size="lg" className="text-violet-500" />
                <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
              </div>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="animate-fade-in-up animation-delay-300">
              <EmptyState
                title={searchQuery ? 'No games found' : 'No games available'}
                description={
                  searchQuery
                    ? `No results for "${searchQuery}". Try adjusting your search.`
                    : 'Start by adding your first game to the catalog.'
                }
                action={
                  <Button 
                    onClick={() => handleOpenModal()} 
                    className="bg-violet-500 hover:bg-violet-600 transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Game
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game, index) => {
                const hasImageError = imageError[game.$id!];
                return (
                  <div
                    key={game.$id}
                    className="group bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-violet-500/50 animate-fade-in-up"
                    style={{ animationDelay: `${(index % 9) * 50 + 300}ms` }}
                  >
                    <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                      {game.image_url && !hasImageError ? (
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={() => handleImageError(game.$id!)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                          <ImageIcon className="w-12 h-12 text-slate-600" />
                        </div>
                      )}
                      {!game.is_active && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                          <span className="px-3 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-sm rounded-full font-medium">
                            Inactive
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-white text-lg mb-2 truncate group-hover:text-violet-400 transition-colors">
                        {game.name}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {game.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-300 hover:scale-110"
                          onClick={() => handleOpenModal(game)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 hover:scale-110"
                          onClick={() => confirmDelete(game)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal - Fixed to ensure visibility */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-lg max-h-[90vh] overflow-y-auto z-[100]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              {editingGame ? 'Edit Game' : 'Add New Game'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingGame ? 'Update the game details below.' : 'Fill in the details to add a new game.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Game Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter game name"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter game description"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Game Image</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-28 h-28 group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl border-2 border-slate-700 group-hover:border-violet-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-all hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-28 h-28 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all group">
                    <Upload className="w-8 h-8 text-slate-500 group-hover:text-violet-400 transition-colors" />
                    <span className="text-xs text-slate-500 mt-2 group-hover:text-violet-400">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-slate-500">PNG, JPG up to 2MB (optional)</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
              <Label htmlFor="is_active" className="cursor-pointer text-slate-300">
                Active
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white transition-all duration-300 hover:scale-105"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  editingGame ? 'Update Game' : 'Create Game'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Delete Game</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete "{gameToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-105"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Games;
