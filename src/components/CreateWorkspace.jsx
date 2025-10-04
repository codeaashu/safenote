import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { track } from '@vercel/analytics';
import { hashPassword } from '../lib/passwordUtils';

const CreateWorkspace = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const checkPasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isStrong: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordStrength = checkPasswordStrength(password);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!passwordStrength.isStrong) {
      toast.error("Please use a stronger password with uppercase, lowercase, numbers, and special characters");
      return;
    }

    setLoading(true);

    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user:', checkError);
        toast.error("Error checking username availability");
        setLoading(false);
        return;
      }

      if (existingUser) {
        toast.error("This username is already taken");
        setLoading(false);
        return;
      }

      // Hash the password before storing
      const hashedPassword = await hashPassword(password);

      // Create new user workspace
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: username.toLowerCase(),
          password: hashedPassword,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('User created successfully:', data);
      toast.success("Workspace created successfully!");
      
      // Track workspace creation event
      track('workspace_created', {
        username: username.toLowerCase()
      });
      
      // Navigate with password for immediate login and encryption setup
      navigate(`/${username}`, { state: { password: password } });
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error(`Failed to create workspace: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
              Create New Workspace
            </CardTitle>
            <p className="text-slate-400 mt-2">
              Great! This site doesn&apos;t exist, it can be yours!
            </p>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                💡 Tip: Use a unique, strong password! <br />A strong password is your first line of trust.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </label>
                <Input
                  value={username || ""}
                  disabled
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                  required
                />
                {password && (
                  <div className="text-xs space-y-1">
                    <p className="text-slate-400">Password requirements:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div className={`flex items-center gap-1 ${passwordStrength.minLength ? 'text-green-400' : 'text-slate-500'}`}>
                        <span>{passwordStrength.minLength ? '✓' : '○'}</span> 8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasUpperCase ? 'text-green-400' : 'text-slate-500'}`}>
                        <span>{passwordStrength.hasUpperCase ? '✓' : '○'}</span> Uppercase
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasLowerCase ? 'text-green-400' : 'text-slate-500'}`}>
                        <span>{passwordStrength.hasLowerCase ? '✓' : '○'}</span> Lowercase
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasNumbers ? 'text-green-400' : 'text-slate-500'}`}>
                        <span>{passwordStrength.hasNumbers ? '✓' : '○'}</span> Numbers
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasSpecialChar ? 'text-green-400' : 'text-slate-500'}`}>
                        <span>{passwordStrength.hasSpecialChar ? '✓' : '○'}</span> Special (!@#$)
                      </div>
                    </div>
                    {passwordStrength.isStrong && (
                      <p className="text-green-400 font-medium">✓ Strong password!</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-slate-900/50 border-slate-600/50 text-white"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gray-900/50 text-white border-slate-600/50 hover:bg-gray-800/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateWorkspace;
