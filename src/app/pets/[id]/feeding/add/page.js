'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../services/petService';
import { createFeedingSchedule } from '../../../../../services/feedingService';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import Navbar from '../../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea, Checkbox } from '@radix-ui/themes';

export default function AddFeedingSchedule() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    feedingTime: '08:00',
    foodType: '',
    portion: '',
    notes: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Common food types for selection
  const foodTypes = [
    { value: 'dry_kibble', label: 'Dry Kibble' },
    { value: 'wet_food', label: 'Wet Food' },
    { value: 'raw_diet', label: 'Raw Diet' },
    { value: 'homemade', label: 'Homemade Food' },
    { value: 'prescription', label: 'Prescription Diet' },
    { value: 'treats', label: 'Treats' },
    { value: 'other', label: 'Other' }
  ];

  // Common portion sizes
  const portionSizes = [
    { value: '1/4_cup', label: '1/4 Cup' },
    { value: '1/3_cup', label: '1/3 Cup' },
    { value: '1/2_cup', label: '1/2 Cup' },
    { value: '2/3_cup', label: '2/3 Cup' },
    { value: '3/4_cup', label: '3/4 Cup' },
    { value: '1_cup', label: '1 Cup' },
    { value: '1.5_cups', label: '1.5 Cups' },
    { value: '2_cups', label: '2 Cups' },
    { value: 'small_can', label: 'Small Can' },
    { value: 'large_can', label: 'Large Can' },
    { value: 'custom', label: 'Custom Amount' }
  ];

  // Check if user is authenticated and fetch pet data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);
      } catch (err) {
        console.error('Error fetching pet data:', err);
        setError('Failed to load pet data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (petId) {
      fetchData();
    }
  }, [user, router, petId]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Format the feeding time to include seconds (API expects HH:MM:SS)
      const formattedTime = `${formData.feedingTime}:00`;

      // Prepare feeding schedule data
      const scheduleData = {
        petId: parseInt(petId),
        feedingTime: formattedTime,
        foodType: formData.foodType === 'other' && formData.customFoodType
          ? formData.customFoodType
          : (foodTypes.find(type => type.value === formData.foodType)?.label || formData.foodType),
        portion: formData.portionSize === 'custom' && formData.customPortion
          ? formData.customPortion
          : (portionSizes.find(size => size.value === formData.portionSize)?.label || formData.portionSize),
        notes: formData.notes,
        isActive: formData.isActive
      };

      // Call API to create feeding schedule
      await createFeedingSchedule(scheduleData);

      // Redirect back to feeding schedules list
      router.push(`/pets/${petId}/feeding`);
    } catch (err) {
      console.error('Error creating feeding schedule:', err);
      setError('Failed to create feeding schedule. Please try again.');
      setIsSaving(false);
    }
  };

  const addFeedingScheduleContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Add Feeding Schedule for {pet?.name || 'Pet'}</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading pet details...</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="feedingTime">
                      Feeding Time*
                    </Text>
                    <TextField.Root
                      id="feedingTime"
                      type="time"
                      value={formData.feedingTime}
                      onChange={handleChange}
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="foodType">
                      Food Type*
                    </Text>
                    <Select.Root
                      value={formData.foodType}
                      onValueChange={(value) => handleSelectChange('foodType', value)}
                    >
                      <Select.Trigger id="foodType" placeholder="Select food type" />
                      <Select.Content>
                        {foodTypes.map(type => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  {formData.foodType === 'other' && (
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="customFoodType">
                        Custom Food Type*
                      </Text>
                      <TextField.Root
                        id="customFoodType"
                        value={formData.customFoodType || ''}
                        onChange={handleChange}
                        placeholder="Enter custom food type"
                        required={formData.foodType === 'other'}
                      />
                    </Box>
                  )}

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="portionSize">
                      Portion Size*
                    </Text>
                    <Select.Root
                      value={formData.portionSize}
                      onValueChange={(value) => handleSelectChange('portionSize', value)}
                    >
                      <Select.Trigger id="portionSize" placeholder="Select portion size" />
                      <Select.Content>
                        {portionSizes.map(size => (
                          <Select.Item key={size.value} value={size.value}>
                            {size.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  {formData.portionSize === 'custom' && (
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="customPortion">
                        Custom Portion*
                      </Text>
                      <TextField.Root
                        id="customPortion"
                        value={formData.customPortion || ''}
                        onChange={handleChange}
                        placeholder="Enter custom portion size"
                        required={formData.portionSize === 'custom'}
                      />
                    </Box>
                  )}

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="notes">
                      Notes
                    </Text>
                    <TextArea
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any special instructions or notes"
                    />
                  </Box>

                  <Box>
                    <Flex align="center" gap="2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                      <Text as="label" size="2" htmlFor="isActive">
                        Active
                      </Text>
                    </Flex>
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Add Feeding Schedule'}
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() => router.push(`/pets/${petId}/feeding`)}
                    >
                      Cancel
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
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="AddFeedingSchedule">
        {addFeedingScheduleContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}