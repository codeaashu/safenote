import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Plus, Calendar, Eye, ArrowLeft, User, Copy, Trash, Pencil, Share, Check } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { track } from '@vercel/analytics';
import { verifyPassword, isBcryptHash, hashPassword } from '../lib/passwordUtils';
import { encryptText, decryptText, isEncrypted } from '../lib/encryptionUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserWorkspace = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [userPassword, setUserPassword] = useState(""); // Store for encryption
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pastes, setPastes] = useState([]);
  const [newPaste, setNewPaste] = useState({ title: "", content: "" });
  const [editingPaste, setEditingPaste] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { error } = await supabase
          .from('users')
          .select('username')
          .eq('username', username.toLowerCase())
          .single();

        if (error && error.code === 'PGRST116') {
          // User doesn't exist
          setUserExists(false);
        } else if (error) {
          throw error;
        } else {
          setUserExists(true);
          
          // Check if password was passed from CreateWorkspace
          if (location.state?.password) {
            setPassword(location.state.password);
            setUserPassword(location.state.password);
            setIsAuthenticated(true);
            fetchUserPastes();
            // Clear the password from location state
            navigate(location.pathname, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
        toast.error("Error checking user");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [username, location.state, navigate, location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First get the user record with the hashed password
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('username, password')
        .eq('username', username.toLowerCase())
        .single();

      if (fetchError || !userData) {
        toast.error("Invalid username or password");
        setLoading(false);
        return;
      }

      // Check if password is already hashed or plain text (for migration)
      let isPasswordValid = false;
      
      if (isBcryptHash(userData.password)) {
        // Verify against bcrypt hash
        isPasswordValid = await verifyPassword(password, userData.password);
      } else {
        // Legacy plain text comparison (for existing users)
        isPasswordValid = password === userData.password;
        
        // If valid, upgrade to hashed password
        if (isPasswordValid) {
          const hashedPassword = await hashPassword(password);
          await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('username', username.toLowerCase());
        }
      }

      if (!isPasswordValid) {
        toast.error("Invalid password");
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserPassword(password); // Store for encryption
      toast.success(`Welcome back, ${username}!`);
      
      // Track workspace login event
      track('workspace_login', {
        username: username.toLowerCase()
      });
      
      fetchUserPastes();
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error("Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPastes = async () => {
    try {
      const { data, error } = await supabase
        .from('pastes')
        .select('*')
        .eq('username', username.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Decrypt all pastes
      const decryptedPastes = await Promise.all(
        (data || []).map(async (paste) => {
          try {
            // Check if already encrypted
            if (isEncrypted(paste.title) && isEncrypted(paste.content)) {
              return {
                ...paste,
                title: await decryptText(paste.title, userPassword),
                content: await decryptText(paste.content, userPassword)
              };
            } else {
              // Legacy unencrypted note - encrypt it
              const encryptedTitle = await encryptText(paste.title, userPassword);
              const encryptedContent = await encryptText(paste.content, userPassword);
              
              // Update in database
              await supabase
                .from('pastes')
                .update({
                  title: encryptedTitle,
                  content: encryptedContent
                })
                .eq('id', paste.id);
              
              return paste; // Return original for display
            }
          } catch (decryptError) {
            console.warn('Failed to decrypt paste:', paste.id, decryptError);
            // Return as-is if decryption fails (might be corrupted)
            return {
              ...paste,
              title: '[Encrypted - Unable to decrypt]',
              content: '[This note appears to be encrypted but cannot be decrypted with your current password]'
            };
          }
        })
      );
      
      setPastes(decryptedPastes);
    } catch (error) {
      console.error('Error fetching pastes:', error);
      toast.error("Failed to load pastes");
    }
  };

  const handleCreatePaste = async (e) => {
    e.preventDefault();
    
    if (!newPaste.title || !newPaste.content) {
      toast.error("Please fill in both title and content");
      return;
    }

    setLoading(true);

    try {
      // Encrypt the note content before storing
      console.log('🔐 Attempting to encrypt note...');
      
      let encryptedTitle, encryptedContent;
      
      try {
        encryptedTitle = await encryptText(newPaste.title, userPassword);
        encryptedContent = await encryptText(newPaste.content, userPassword);
        console.log('✅ Encryption successful');
      } catch (encryptError) {
        console.error('❌ Encryption failed, falling back to plain text:', encryptError);
        toast.error("Encryption failed - storing as plain text for now");
        encryptedTitle = newPaste.title;
        encryptedContent = newPaste.content;
      }

      const { data, error } = await supabase
        .from('pastes')
        .insert([{
          title: encryptedTitle,
          content: encryptedContent,
          username: username.toLowerCase(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Decrypt for local state
      const decryptedPaste = {
        ...data,
        title: await decryptText(data.title, userPassword),
        content: await decryptText(data.content, userPassword)
      };

      setPastes([decryptedPaste, ...pastes]);
      setNewPaste({ title: "", content: "" });
      setShowCreateForm(false);
      toast.success("Paste created successfully!");
      
      // Track paste creation event
      track('paste_created', {
        username: username.toLowerCase(),
        pasteId: data.id
      });
    } catch (error) {
      console.error('Error creating paste:', error);
      toast.error("Failed to create paste");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaste = async (e) => {
    e.preventDefault();
    
    if (!editingPaste.title || !editingPaste.content) {
      toast.error("Please fill in both title and content");
      return;
    }

    setLoading(true);

    try {
      // Encrypt the updated content
      const encryptedTitle = await encryptText(editingPaste.title, userPassword);
      const encryptedContent = await encryptText(editingPaste.content, userPassword);

      const { data, error } = await supabase
        .from('pastes')
        .update({
          title: encryptedTitle,
          content: encryptedContent,
        })
        .eq('id', editingPaste.id)
        .select()
        .single();

      if (error) throw error;

      // Decrypt for local state
      const decryptedPaste = {
        ...data,
        title: await decryptText(data.title, userPassword),
        content: await decryptText(data.content, userPassword)
      };

      // Update the paste in the local state
      setPastes(pastes.map(p => p.id === editingPaste.id ? decryptedPaste : p));
      setEditingPaste(null);
      toast.success("Paste updated successfully!");
      
      // Track paste update event
      track('paste_updated', {
        username: username.toLowerCase(),
        pasteId: data.id
      });
    } catch (error) {
      console.error('Error updating paste:', error);
      toast.error("Failed to update paste");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (pasteId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(pasteId);
    toast.success("Content copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (pasteId) => {
    setDeleteId(pasteId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('pastes')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setPastes(pastes.filter(p => p.id !== deleteId));
      toast.success("Paste deleted successfully!");
    } catch (error) {
      console.error('Error deleting paste:', error);
      toast.error("Failed to delete paste");
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const ShareMenu = ({ paste }) => {
    const shareUrl = `${window.location.origin}/paste/${paste.id}`;
    const copyToClipboard = () => {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    };
    return (
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 hover:text-blue-400 transition-all duration-300"
        onClick={copyToClipboard}
      >
        <Share className="w-4 h-4" />
      </Button>
    );
  };

  const filteredPastes = pastes.filter((paste) =>
    paste.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  // User doesn't exist - show create option
  if (userExists === false) {
    return (
      <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
        <div className="max-w-md mx-auto">
          <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-gray-900/50 text-white border-purple-500/30 hover:bg-gray-500/50 hover:text-white w-24 mb-4"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Create New Site?
              </CardTitle>
              <p className="text-slate-400 mt-2">
                Great! This site doesn&apos;t exist, it can be yours!
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-slate-300">Would you like to create:</p>
                <p className="text-xl font-semibold text-white flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  {username}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gray-900/50 text-white border-slate-600/50 hover:bg-gray-800/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => navigate(`/${username}/create`)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User exists but not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
        <div className="max-w-md mx-auto">
          <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="bg-gray-900/50 text-white border-purple-500/30 hover:bg-gray-500/50 hover:text-white w-24 mb-4"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Enter Password
              </CardTitle>
              <p className="text-slate-400 mt-2">
                Welcome to <span className="text-white font-semibold">{username}&apos;s</span> workspace
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password to access this workspace"
                    className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {loading ? "Accessing..." : "Access Workspace"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User is authenticated - show workspace
  return (
    <div className="min-h-screen w-full p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {username}&apos;s Workspace
          </h1>
          <p className="text-slate-400">
            Your private notes and messages - share this page with your password to give others access
          </p>
          
          {/* Copy Page Link Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-600/30">
              <span className="text-slate-300 text-sm font-mono">
                {window.location.origin}/{username}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:text-blue-400 transition-all duration-300"
                onClick={() => {
                  const pageUrl = `${window.location.origin}/${username}`;
                  navigator.clipboard.writeText(pageUrl);
                  toast.success("Workspace link copied to clipboard!");
                }}
                title="Copy workspace link"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            
            <Button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setEditingPaste(null); // Close edit form when creating
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Plus className="mr-2 w-4 h-4" />
              {showCreateForm ? "Cancel" : "Create New Notes"}
            </Button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Create New Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePaste} className="space-y-4">
                <Input
                  value={newPaste.title}
                  onChange={(e) => setNewPaste({ ...newPaste, title: e.target.value })}
                  placeholder="Enter notes title..."
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                  required
                />
                <textarea
                  value={newPaste.content}
                  onChange={(e) => setNewPaste({ ...newPaste, content: e.target.value })}
                  placeholder="Enter your content here..."
                  className="w-full min-h-[200px] p-4 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white resize-none"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {loading ? "Creating..." : "Create Notes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        {editingPaste && (
          <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Edit Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePaste} className="space-y-4">
                <Input
                  value={editingPaste.title}
                  onChange={(e) => setEditingPaste({ ...editingPaste, title: e.target.value })}
                  placeholder="Enter notes title..."
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                  required
                />
                <textarea
                  value={editingPaste.content}
                  onChange={(e) => setEditingPaste({ ...editingPaste, content: e.target.value })}
                  placeholder="Enter your content here..."
                  className="w-full min-h-[200px] p-4 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white resize-none"
                  required
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingPaste(null)}
                    className="flex-1 bg-gray-900/50 text-white border-slate-600/50 hover:bg-gray-800/50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                  >
                    {loading ? "Updating..." : "Update Notes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Pastes */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Recent Notes</h2>
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-slate-900/50 border-slate-600/50 text-white placeholder-slate-400"
            />
          </div>
          
          {filteredPastes.length === 0 ? (
            <Card className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-xl">
              <CardContent className="text-center py-12">
                <p className="text-slate-400">
                  {pastes.length === 0 ? "No notes yet. Create your first note above!" : "No notes match your search."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPastes.map((paste) => (
                <Card key={paste.id} className="border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2 truncate">{paste.title}</h3>
                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                          {paste.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(paste.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-start gap-1 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-green-400 transition-all duration-300"
                          onClick={() => handleCopy(paste.id, paste.content)}
                          title="Copy content"
                        >
                          {copiedId === paste.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-blue-400 transition-all duration-300"
                          onClick={() => navigate(`/paste/${paste.id}`)}
                          title="View note"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <ShareMenu paste={paste} />

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-yellow-400 transition-all duration-300"
                          onClick={() => {
                            setEditingPaste(paste);
                            setShowCreateForm(false); // Close create form when editing
                          }}
                          title="Edit paste"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-red-400 transition-all duration-300"
                          onClick={() => handleDelete(paste.id)}
                          title="Delete paste"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="bg-slate-900 border border-slate-700 shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This action cannot be undone. This will permanently delete your note.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UserWorkspace;
