'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import FeatureErrorBoundary from '../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box } from '@radix-ui/themes';
import { requestPasswordReset } from '../../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Call the API to request a password reset
      const response = await requestPasswordReset(email);

      if (response.success) {
        setSuccess(response.message || `Password reset link has been sent to ${email}. Please check your email.`);
        setEmail(''); // Clear the form
      } else {
        setError(response.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPasswordContent = (
    <>
      <Navbar />
      <Container size="1" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Reset Your Password</Heading>
            <Text size="2" color="gray" align="center">
              Enter your email address and we'll send you a link to reset your password.
            </Text>

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

            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" mb="1" htmlFor="email">
                    Email
                  </Text>
                  <TextField.Root
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </Box>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Flex>
            </form>

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
    <FeatureErrorBoundary featureName="ForgotPassword">
      {forgotPasswordContent}
    </FeatureErrorBoundary>
  );
}