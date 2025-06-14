'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../services/petService';
import { createWeight } from '../../../../../services/weightService';
import Navbar from '../../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select } from '@radix-ui/themes';

export default function AddWeightRecord() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    weight: '',
    weightUnit: 'lbs',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Weight units for selection
  const weightUnits = [
    { value: 'lbs', label: 'lbs (pounds)' },
    { value: 'kg', label: 'kg (kilograms)' },
    { value: 'g', label: 'g (grams)' }
  ];

  // Check if user is authenticated and fetch pet data
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const petData = await getPetById(petId);
        setPet(petData);

        // Set default weight unit based on pet's existing unit
        if (petData.weightUnit) {
          setFormData(prev => ({
            ...prev,
            weightUnit: petData.weightUnit
          }));
        }
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError('Failed to load pet details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [user, router, petId]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
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
      // Prepare weight record data
      const weightData = {
        petId,
        weightValue: parseFloat(formData.weight),
        weightUnit: formData.weightUnit,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes
      };

      // Call API to create weight record
      const newRecord = await createWeight(weightData);

      // Redirect to weight history page
      router.push(`/pets/${petId}/weight`);
    } catch (err) {
      console.error('Error adding weight record:', err);
      setError('Failed to add weight record. Please try again.');
      setIsSaving(false);
    }
  };

  const addWeightRecordContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Add Weight Record for {pet?.name || 'Pet'}</Heading>

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
                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="weight">
                        Weight*
                      </Text>
                      <TextField.Root
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="Enter weight"
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="weightUnit">
                        Unit
                      </Text>
                      <Select.Root
                        value={formData.weightUnit}
                        onValueChange={(value) => handleSelectChange('weightUnit', value)}
                      >
                        <Select.Trigger id="weightUnit" />
                        <Select.Content>
                          {weightUnits.map(unit => (
                            <Select.Item key={unit.value} value={unit.value}>
                              {unit.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="date">
                      Date*
                    </Text>
                    <TextField.Root
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="notes">
                      Notes
                    </Text>
                    <TextField.Root
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
                    />
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Weight Record'}
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() => router.push(`/pets/${petId}`)}
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
      <FeatureErrorBoundary featureName="AddWeightRecord">
        {addWeightRecordContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
