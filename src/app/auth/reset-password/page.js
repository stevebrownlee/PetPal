'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import FeatureErrorBoundary from '../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box } from '@radix-ui/themes';
import { resetPassword } from '../../../services/authService';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // Validate the token when component mounts
    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token. Please request a new password reset link.');
        return;
      }

      // For this implementation, we'll assume the token is valid if it exists
      // The actual validation will happen when the user submits the form
      setTokenValid(true);
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to reset the password
      const response = await resetPassword(token, password, confirmPassword);

      if (response.success) {
        setSuccess(response.message || 'Password has been reset successfully. You can now log in with your new password.');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordContent = (
    <>
      <Navbar />
      <Container size="1" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Reset Your Password</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {success && (
              <Text color="green" size="2">
                {success}
              </Text>
            )}

            {tokenValid && !success && (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="password">
                      New Password
                    </Text>
                    <TextField.Root
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="confirmPassword">
                      Confirm New Password
                    </Text>
                    <TextField.Root
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </Box>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Flex>
              </form>
            )}

            {!tokenValid && (
              <Flex justify="center" mt="4">
                <Link href="/auth/forgot-password" passHref>
                  <Button>Request New Reset Link</Button>
                </Link>
              </Flex>
            )}

            {success && (
              <Flex justify="center" mt="4">
                <Link href="/auth/login" passHref>
                  <Button>Go to Login</Button>
                </Link>
              </Flex>
            )}

            <Flex justify="center" mt="4">
              <Text size="2">
                Remember your password?{' '}
                <Link href="/auth/login" style={{ color: 'var(--accent-9)' }}>
                  Back to Login
                </Link>
              </Text>
            </Flex>
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <FeatureErrorBoundary featureName="ResetPassword">
      {resetPasswordContent}
    </FeatureErrorBoundary>
  );
}