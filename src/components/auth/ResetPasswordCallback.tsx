import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ResetPasswordCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleResetPassword = async () => {
      try {
        // First, try to get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          throw new Error('No valid session found');
        }

        // Get the token from the URL
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('No reset token found');
        }

        // Verify the token exists in our database and hasn't expired
        const { data: resetData, error: verifyError } = await supabase
          .from('password_resets')
          .select('*')
          .eq('token', token)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (verifyError || !resetData) {
          throw new Error('Invalid or expired reset token');
        }

        // If we get here, the token is valid and we have a session
        toast.success('Please set your new password');
        navigate(`/auth/reset-password?token=${token}`);
      } catch (error: any) {
        console.error('Error handling password reset:', error);
        toast.error(error.message || 'Invalid or expired reset link');
        navigate('/');
      }
    };

    handleResetPassword();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-[#dfe9f3] to-white">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Processing password reset...</h2>
        <p className="text-gray-500">Please wait while we verify your reset link.</p>
      </div>
    </div>
  );
} 