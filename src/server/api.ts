import { sendPasswordResetEmail } from './email';
import { SupabaseClient } from '@supabase/supabase-js';

export async function handlePasswordResetRequest(email: string, resetToken: string, origin: string) {
  try {
    await sendPasswordResetEmail(email, resetToken, origin);
    return { success: true };
  } catch (error: any) {
    console.error('Error in handlePasswordResetRequest:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send password reset email' 
    };
  }
}

export async function handlePasswordUpdate(token: string, newPassword: string, supabase: SupabaseClient) {
  try {
    console.log('Verifying token...');
    // Verify the token exists and is valid
    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('email, user_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (resetError) {
      console.error('Token verification error:', resetError);
      throw new Error('Invalid or expired reset token');
    }

    if (!resetData) {
      console.error('No reset data found for token');
      throw new Error('Invalid or expired reset token');
    }

    console.log('Token verified, updating password...');
    // Update the user's password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      resetData.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      throw updateError;
    }

    console.log('Password updated, deleting token...');
    // Delete the used reset token
    await supabase
      .from('password_resets')
      .delete()
      .eq('token', token);

    console.log('Token deleted, password reset complete');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating password:', error);
    return {
      success: false,
      error: error.message || 'Failed to update password'
    };
  }
} 