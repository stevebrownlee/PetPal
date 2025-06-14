'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUser, updateUserProfile } from '../../services/authService';
import Navbar from '../../components/Navbar';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select } from '@radix-ui/themes';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    preferredContactMethod: 'email'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch user profile data from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsFetching(true);
        const userData = await getCurrentUser();

        if (userData) {
          // The address data from the API has the following strucuture: `address: "78 N Harrison Ave, Bellevue, PA, 15202"`
          // Parse address if it exists
          let address = { street: '', city: '', state: '', zipCode: '' };

          if (userData.address && typeof userData.address === 'string') {
            const addressParts = userData.address.split(',').map(part => part.trim());
            address = {
              street: addressParts[0] || '',
              city: addressParts[1] || '',
              state: addressParts[2] || '',
              zipCode: addressParts[3] || ''
            };
          }

          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: {
              street: address.street || '',
              city: address.city || '',
              state: address.state || '',
              zipCode: address.zipCode || ''
            },
            preferredContactMethod: userData.preferredContactMethod || 'email'
          });
        } else {
          // Redirect to login if not authenticated
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Handle nested address fields
    if (id.startsWith('address.')) {
      const addressField = id.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      preferredContactMethod: value
    }));
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic format check)
    const phoneRegex = /^[0-9\-\(\)\s\+\.]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    // ZIP code validation (if provided)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (formData.address.zipCode && !zipRegex.test(formData.address.zipCode)) {
      setError('Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call API to update user profile
      const response = await updateUserProfile(formData);

      if (response) {
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(`Failed to update profile: ${err.message || 'Please try again'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const profileContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">My Profile</Heading>

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

            {isFetching ? (
              <Text align="center">Loading profile data...</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="firstName">
                        First Name
                      </Text>
                      <TextField.Root
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="lastName">
                        Last Name
                      </Text>
                      <TextField.Root
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                      />
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="email">
                      Email
                    </Text>
                    <TextField.Root
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="phone">
                      Phone Number
                    </Text>
                    <TextField.Root
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="address.street">
                      Street Address
                    </Text>
                    <TextField.Root
                      id="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      placeholder="Enter your street address"
                      required
                    />
                  </Box>

                  <Grid columns="3" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="address.city">
                        City
                      </Text>
                      <TextField.Root
                        id="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        placeholder="Enter your city"
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="address.state">
                        State
                      </Text>
                      <TextField.Root
                        id="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        placeholder="Enter your state"
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="address.zipCode">
                        ZIP Code
                      </Text>
                      <TextField.Root
                        id="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        placeholder="Enter your ZIP code"
                        required
                      />
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="preferredContactMethod">
                      Preferred Contact Method
                    </Text>
                    <Select.Root
                      value={formData.preferredContactMethod}
                      onValueChange={handleSelectChange}
                    >
                      <Select.Trigger id="preferredContactMethod" />
                      <Select.Content>
                        <Select.Item value="email">Email</Select.Item>
                        <Select.Item value="phone">Phone</Select.Item>
                        <Select.Item value="mail">Mail</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                    <Button type="button" variant="soft" onClick={() => router.push('/change-password')}>
                      Change Password
                    </Button>
                  </Flex>
                </Flex>
              </form>
            )}
          </Flex>
        </Card>
      </Container>
    </>
  );

  return (
    <FeatureErrorBoundary featureName="Profile">
      {profileContent}
    </FeatureErrorBoundary>
  );
}