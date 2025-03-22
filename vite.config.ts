import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { Resend } from 'resend';
import type { Connect, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { handlePasswordUpdate } from './src/server/api';
import { supabaseAdmin } from './src/lib/supabaseAdmin';
import type { User } from '@supabase/supabase-js';

const resend = new Resend('re_Q5Sox36V_8YzXXmrwRzhvhHWnYqeM5xpQ');
const PORT = 5178;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    plugins: [
      react(),
      {
        name: 'configure-server',
        configureServer(server: ViteDevServer) {
          server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
            // Add CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            // Handle OPTIONS request for CORS
            if (req.method === 'OPTIONS') {
              res.writeHead(200);
              res.end();
              return;
            }

            // Handle password reset email endpoint
            if (req.url === '/api/send-password-reset' && req.method === 'POST') {
              let body = '';
              
              req.on('data', (chunk: Buffer) => {
                body += chunk.toString();
              });

              req.on('end', async () => {
                try {
                  console.log('Received password reset request:', body);
                  const { email, resetToken } = JSON.parse(body);
                  console.log('Parsed request:', { email, resetToken });

                  if (!email || !resetToken) {
                    console.error('Missing required fields:', { email, resetToken });
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                      success: false, 
                      error: 'Missing required fields' 
                    }));
                    return;
                  }

                  // Get user ID using admin API
                  console.log('Looking up user:', email);
                  try {
                    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
                    
                    if (userError) {
                      console.error('Error listing users:', userError);
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Failed to find user' 
                      }));
                      return;
                    }

                    console.log('Found users:', users);
                    const user = users.users.find((u: User) => u.email === email);
                    if (!user) {
                      console.error('User not found:', email);
                      res.writeHead(404, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ 
                        success: false, 
                        error: 'No account exists with this email. Please create a new account.' 
                      }));
                      return;
                    }

                    console.log('Found user:', user.id);

                    // Create password reset record
                    const resetData = {
                      email,
                      user_id: user.id,
                      token: resetToken,
                      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                      used: false
                    };
                    console.log('Creating reset record:', resetData);

                    try {
                      // First, invalidate any existing unused tokens for this user
                      await supabaseAdmin
                        .from('password_resets')
                        .update({ used: true })
                        .eq('user_id', user.id)
                        .eq('used', false);

                      // Create new reset record
                      const { error: dbError } = await supabaseAdmin
                        .from('password_resets')
                        .insert(resetData);

                      if (dbError) {
                        console.error('Database error:', dbError);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                          success: false, 
                          error: 'Failed to initiate password reset',
                          details: dbError.message
                        }));
                        return;
                      }

                      console.log('Reset record created successfully');
                      
                      // Get the actual server port
                      const resetLink = `http://localhost:${PORT}/auth/reset-password?token=${resetToken}`;
                      console.log('Sending reset email to:', email);
                      
                      try {
                        const { data, error } = await resend.emails.send({
                          from: 'Flashjobs <noreply@shantanukhoraskar.com>',
                          to: email,
                          subject: 'Reset Your Password',
                          html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                              <h2 style="color: #1a56db;">Reset Your Password</h2>
                              <p>Hello,</p>
                              <p>We received a request to reset your password. Click the button below to create a new password:</p>
                              <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetLink}" 
                                   style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                  Reset Password
                                </a>
                              </div>
                              <p>If you didn't request this password reset, you can safely ignore this email.</p>
                              <p>This link will expire in 1 hour.</p>
                              <p>Best regards,<br>The Flashjobs Team</p>
                            </div>
                          `,
                        });

                        if (error) {
                          console.error('Email error:', error);
                          res.writeHead(500, { 'Content-Type': 'application/json' });
                          res.end(JSON.stringify({ 
                            success: false, 
                            error: error.message 
                          }));
                          return;
                        }

                        console.log('Reset email sent successfully');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                          success: true, 
                          data 
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-server',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
          // Add CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          // Handle OPTIONS request for CORS
          if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
          }

          // Handle password reset email endpoint
          if (req.url === '/api/send-password-reset' && req.method === 'POST') {
            let body = '';
            
            req.on('data', (chunk: Buffer) => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                console.log('Received password reset request:', body);
                const { email, resetToken } = JSON.parse(body);
                console.log('Parsed request:', { email, resetToken });

                if (!email || !resetToken) {
                  console.error('Missing required fields:', { email, resetToken });
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Missing required fields' 
                  }));
                  return;
                }

                // Get user ID using admin API
                console.log('Looking up user:', email);
                try {
                  const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
                  
                  if (userError) {
                    console.error('Error listing users:', userError);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                      success: false, 
                      error: 'Failed to find user' 
                    }));
                    return;
                  }

                  console.log('Found users:', users);
                  const user = users.users.find((u: User) => u.email === email);
                  if (!user) {
                    console.error('User not found:', email);
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                      success: false, 
                      error: 'No account exists with this email. Please create a new account.' 
                    }));
                    return;
                  }

                  console.log('Found user:', user.id);

                  // Create password reset record
                  const resetData = {
                    email,
                    user_id: user.id,
                    token: resetToken,
                    expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                    used: false
                  };
                  console.log('Creating reset record:', resetData);

                  try {
                    // First, invalidate any existing unused tokens for this user
                    await supabaseAdmin
                      .from('password_resets')
                      .update({ used: true })
                      .eq('user_id', user.id)
                      .eq('used', false);

                    // Create new reset record
                    const { error: dbError } = await supabaseAdmin
                      .from('password_resets')
                      .insert(resetData);

                    if (dbError) {
                      console.error('Database error:', dbError);
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Failed to initiate password reset',
                        details: dbError.message
                      }));
                      return;
                    }

                    console.log('Reset record created successfully');
                    
                    // Get the actual server port
                    const resetLink = `http://localhost:${PORT}/auth/reset-password?token=${resetToken}`;
                    console.log('Sending reset email to:', email);
                    
                    try {
                      const { data, error } = await resend.emails.send({
                        from: 'Flashjobs <noreply@shantanukhoraskar.com>',
                        to: email,
                        subject: 'Reset Your Password',
                        html: `
                          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #1a56db;">Reset Your Password</h2>
                            <p>Hello,</p>
                            <p>We received a request to reset your password. Click the button below to create a new password:</p>
                            <div style="text-align: center; margin: 30px 0;">
                              <a href="${resetLink}" 
                                 style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Reset Password
                              </a>
                            </div>
                            <p>If you didn't request this password reset, you can safely ignore this email.</p>
                            <p>This link will expire in 1 hour.</p>
                            <p>Best regards,<br>The Flashjobs Team</p>
                          </div>
                        `,
                      });

                      if (error) {
                        console.error('Email error:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                          success: false, 
                          error: error.message 
                        }));
                        return;
                      }

                      console.log('Reset email sent successfully');
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ 
                        success: true, 
                        data 
                      }));
                    } catch (emailError) {
                      console.error('Error sending email:', emailError);
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Failed to send reset email',
                        details: emailError instanceof Error ? emailError.message : 'Unknown error'
                      }));
                    }
                  } catch (dbError) {
                    console.error('Error inserting reset record:', dbError);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                      success: false, 
                      error: 'Failed to create reset record',
                      details: dbError instanceof Error ? dbError.message : 'Unknown error'
                    }));
                  }
                } catch (userError) {
                  console.error('Error in user lookup:', userError);
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Failed to look up user',
                    details: userError instanceof Error ? userError.message : 'Unknown error'
                  }));
                }
              } catch (error) {
                console.error('Error processing request:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  success: false, 
                  error: error instanceof Error ? error.message : 'Internal server error' 
                }));
              }
            });
            return;
          }

          // Handle password update endpoint
          if (req.url === '/api/update-password' && req.method === 'POST') {
            let body = '';
            
            req.on('data', (chunk: Buffer) => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              res.setHeader('Content-Type', 'application/json');
              
              try {
                const data = JSON.parse(body);
                
                if (!data.token || !data.newPassword) {
                  res.writeHead(400);
                  res.end(JSON.stringify({ 
                    success: false,
                    error: 'Missing required fields' 
                  }));
                  return;
                }

                const result = await handlePasswordUpdate(data.token, data.newPassword, supabaseAdmin);
                
                res.writeHead(result.success ? 200 : 400);
                res.end(JSON.stringify(result));
              } catch (error) {
                console.error('Error in update-password API:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ 
                  success: false, 
                  error: error instanceof Error ? error.message : 'Internal server error' 
                }));
              }
            });
            return;
          }

          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: PORT,
    strictPort: true
  }
});