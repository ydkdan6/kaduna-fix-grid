import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function UserAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-400 rounded-full animate-spin"></div>
          <p className="text-purple-200 mt-4 text-sm font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/user-dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {});
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast({ title: 'Welcome back', description: 'Signed in successfully' });
      window.location.href = '/user-dashboard';
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to sign in', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {});
      const { error } = await signUp(email, password, fullName);
      if (error) throw error;
      const { error: signInErr } = await signIn(email, password);
      if (!signInErr) {
        toast({ title: 'Welcome', description: 'Account created!' });
        window.location.href = '/user-dashboard';
        return;
      }
      toast({ title: 'Almost there', description: 'Check your email to confirm your account.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to sign up', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="relative z-10">
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Customer Access</CardTitle>
            <CardDescription className="text-purple-200/80 text-base">Sign in or create an account to track your fault reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-1">
                <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-purple-200">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 text-purple-200">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-purple-100 font-medium">Email</Label>
                    <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="bg-white/5 border-white/20 text-white placeholder-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 h-12 transition-all duration-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-purple-100 font-medium">Password</Label>
                    <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="bg-white/5 border-white/20 text-white placeholder-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 h-12 transition-all duration-300" />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-purple-100 font-medium">Full Name</Label>
                    <Input id="signup-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required className="bg-white/5 border-white/20 text-white placeholder-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 h-12 transition-all duration-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-purple-100 font-medium">Email</Label>
                    <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="bg-white/5 border-white/20 text-white placeholder-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 h-12 transition-all duration-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-purple-100 font-medium">Password</Label>
                    <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required className="bg-white/5 border-white/20 text-white placeholder-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 h-12 transition-all duration-300" />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      'Sign Up'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
