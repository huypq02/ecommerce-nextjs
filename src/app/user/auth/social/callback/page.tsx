'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { OAUTH2_URL_FACEBOOK_CALLBACK } from '@/data/navigation';

interface AuthResponse {
  code: number;
  message: string | null;
  data: string;
}

const CallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCalledback = useRef(false);

  useEffect(() => {
    if (hasCalledback.current) return;
    hasCalledback.current = true;

    const handleCallback = async () => {
      try {
        // Get code from searchParams
        const code = searchParams.get('code');
        // Get loginType from localStorage
        const loginType = localStorage.getItem('socialLoginType');

        if (!code || !loginType) {
          throw new Error('Missing parameters');
        }

        const response = await axios.get<AuthResponse>(
          OAUTH2_URL_FACEBOOK_CALLBACK,
          {
            params: {
              code,
              loginType
            },
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        const { data } = response;

        if (data.code === 200 && data?.data) {
          // Store token in localStorage
          localStorage.setItem('token', data.data);
          // Clean up the loginType after successful auth
          localStorage.removeItem('socialLoginType');
          // Save token to axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.data}`;
          
          router.push('/collection');
        } else {
          throw new Error(data.message || 'Authentication failed');
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        if (axios.isAxiosError(error)) {
          console.error('Callback error:', error.response?.data || error.message);
        } else {
          console.error('Callback error:', error);
        }
        router.push('/signup');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Processing authentication...</div>
    </div>
  );
}

export default CallbackPage;