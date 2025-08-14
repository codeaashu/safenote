import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, X } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

const PasswordPrompt = ({ username, onSuccess, onCancel, operation = "access" }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase())
        .eq('password', password)
        .single();

      if (error || !data) {
        toast.error("Invalid password");
        setLoading(false);
        return;
      }

      toast.success("Access granted!");
      onSuccess(password);
    } catch (error) {
      console.error('Error verifying password:', error);
      toast.error("Failed to verify password");
    } finally {
      setLoading(false);
    }
  };

  const operationTexts = {
    access: "access this content",
    delete: "delete this paste",
    edit: "edit this paste",
    copy: "copy this content"
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl shadow-2xl w-full max-w-md mx-4">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="absolute right-2 top-2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
          <CardTitle className="text-xl text-white">Password Required</CardTitle>
          <p className="text-slate-400 text-sm">
            Enter <span className="text-white font-semibold">{username}&apos;s</span> workspace password to {operationTexts[operation]}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter workspace password"
              className="w-full bg-slate-900/50 border-slate-600/50 text-white"
              required
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-gray-900/50 text-white border-slate-600/50 hover:bg-gray-800/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {loading ? "Verifying..." : "Confirm"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordPrompt;
