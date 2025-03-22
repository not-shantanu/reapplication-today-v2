import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('Invalid reset link');
        navigate('/');
        return;
      }

      try {
        // Check if token exists and is not expired
        const { data, error } = await supabase
          .from('password_resets')
          .select('*')
          .eq('token', token)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          console.error('Token verification error:', error);
          toast.error('This password reset link is invalid or has expired');
          navigate('/');
          return;
        }

        setIsValidToken(true);
      } catch (error) {
        console.error('Error verifying token:', error);
        toast.error('Failed to verify reset link');
        navigate('/');
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!token || !isValidToken) {
      toast.error('Invalid reset link');
      navigate('/');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Verify token again before updating password
      const { data: resetData, error: resetError } = await supabase
        .from('password_resets')
        .select('*')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (resetError || !resetData) {
        toast.error('This password reset link is invalid or has expired');
        navigate('/');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      // Delete the used token
      await supabase
        .from('password_resets')
        .delete()
        .eq('token', token);

      toast.success('Password updated successfully! Please log in with your new password.');
      navigate('/');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-[#dfe9f3] to-white">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Verifying reset link...</h2>
          <p className="text-gray-500">Please wait while we verify your reset link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-8">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="mt-2 text-gray-600">Please enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              minLength={6}
              placeholder="Enter your new password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
              minLength={6}
              placeholder="Confirm your new password"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium"
          disabled={loading}
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
} 