'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { getPetById, updatePet, uploadPetPhoto } from '../../../../services/petService';
import Navbar from '../../../../components/Navbar';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import FeatureErrorBoundary from '../../../../components/FeatureErrorBoundary';
import ImageUpload from '../../../../components/ImageUpload';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea } from '@radix-ui/themes';

export default function EditPet() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    birthDate: '',
    weight: '',
    weightUnit: 'lbs',
    color: '',
    gender: '',
    microchipNumber: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [photoUploadError, setPhotoUploadError] = useState('');

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const petData = await getPetById(petId);

        // Format date for input field (YYYY-MM-DD)
        let formattedBirthDate = '';
        if (petData.birthDate) {
          const date = new Date(petData.birthDate);
          if (!isNaN(date.getTime())) {
            formattedBirthDate = date.toISOString().split('T')[0];
          }
        }

        setFormData({
          name: petData.name || '',
          species: petData.species || 'Dog',
          breed: petData.breed || '',
          birthDate: formattedBirthDate,
          weight: petData.weight || '',
          weightUnit: petData.weightUnit || 'lbs',
          color: petData.color || '',
          gender: petData.gender || 'Male',
          microchipNumber: petData.microchipNumber || '',
          notes: petData.notes || ''
        });

        if (petData.imageUrl) {
          setImagePreview(petData.imageUrl);
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

  const handleImageChange = (file) => {
    if (file) {
      setImageFile(file);
      // Preview is handled by the ImageUpload component
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleUploadPhoto = async () => {
    if (!imageFile) return;

    setIsUploadingPhoto(true);
    setPhotoUploadError('');
    setUploadProgress('Uploading photo...');

    try {
      // Upload the photo
      const result = await uploadPetPhoto(petId, imageFile);

      // Update the preview with the returned URL
      if (result.pet && result.pet.imageUrl) {
        setImagePreview(result.pet.imageUrl);

        // Update the pet data with the new image URL
        setFormData(prev => ({
          ...prev,
          imageUrl: result.pet.imageUrl
        }));
      }

      setUploadProgress('Photo uploaded successfully!');

      // Clear the file after successful upload
      setImageFile(null);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setPhotoUploadError('Failed to upload photo. Please try again.');
      setUploadProgress('');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Effect to trigger photo upload when a file is selected
  useEffect(() => {
    if (imageFile) {
      handleUploadPhoto();
    }
  }, [imageFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Create FormData for file upload
      const petData = { ...formData };

      // Convert birthDate to ISO format if needed
      if (petData.birthDate) {
        const date = new Date(petData.birthDate);
        if (!isNaN(date.getTime())) {
          petData.birthDate = date.toISOString();
        }
      }

      // Call API to update pet
      await updatePet(petId, petData);

      // Redirect back to pet details page
      router.push(`/pets/${petId}`);
    } catch (err) {
      console.error('Error updating pet:', err);
      setError('Failed to update pet. Please try again.');
      setIsSaving(false);
    }
  };

  const editPetContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Edit Pet</Heading>

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
                    <Text as="label" size="2" mb="1" htmlFor="name">
                      Pet Name*
                    </Text>
                    <TextField.Root
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter pet name"
                      required
                    />
                  </Box>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="species">
                        Species*
                      </Text>
                      <Select.Root
                        value={formData.species}
                        onValueChange={(value) => handleSelectChange('species', value)}
                      >
                        <Select.Trigger id="species" />
                        <Select.Content>
                          <Select.Item value="Dog">Dog</Select.Item>
                          <Select.Item value="Cat">Cat</Select.Item>
                          <Select.Item value="Bird">Bird</Select.Item>
                          <Select.Item value="Fish">Fish</Select.Item>
                          <Select.Item value="Reptile">Reptile</Select.Item>
                          <Select.Item value="Small Mammal">Small Mammal</Select.Item>
                          <Select.Item value="Other">Other</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="breed">
                        Breed
                      </Text>
                      <TextField.Root
                        id="breed"
                        value={formData.breed}
                        onChange={handleChange}
                        placeholder="Enter breed"
                      />
                    </Box>
                  </Grid>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="birthDate">
                        Birth Date
                      </Text>
                      <TextField.Root
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="gender">
                        Gender
                      </Text>
                      <Select.Root
                        value={formData.gender}
                        onValueChange={(value) => handleSelectChange('gender', value)}
                      >
                        <Select.Trigger id="gender" />
                        <Select.Content>
                          <Select.Item value="Male">Male</Select.Item>
                          <Select.Item value="Female">Female</Select.Item>
                          <Select.Item value="Unknown">Unknown</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Grid>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="weight">
                        Weight
                      </Text>
                      <TextField.Root
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="Enter weight"
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="weightUnit">
                        Weight Unit
                      </Text>
                      <Select.Root
                        value={formData.weightUnit}
                        onValueChange={(value) => handleSelectChange('weightUnit', value)}
                      >
                        <Select.Trigger id="weightUnit" />
                        <Select.Content>
                          <Select.Item value="lbs">lbs</Select.Item>
                          <Select.Item value="kg">kg</Select.Item>
                          <Select.Item value="g">g</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="color">
                      Color
                    </Text>
                    <TextField.Root
                      id="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="Enter color"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="microchipNumber">
                      Microchip Number
                    </Text>
                    <TextField.Root
                      id="microchipNumber"
                      value={formData.microchipNumber}
                      onChange={handleChange}
                      placeholder="Enter microchip number (if available)"
                    />
                  </Box>

                  <Box>
                    <ImageUpload
                      label="Pet Photo"
                      onImageChange={handleImageChange}
                      previewUrl={imagePreview}
                      isUploading={isUploadingPhoto}
                      uploadProgress={uploadProgress}
                      onClearImage={handleClearImage}
                    />
                    {photoUploadError && (
                      <Text color="red" size="2" mt="1">
                        {photoUploadError}
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="notes">
                      Notes
                    </Text>
                    <TextArea
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional information about your pet"
                      style={{ minHeight: '100px' }}
                    />
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
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
      <FeatureErrorBoundary featureName="EditPet">
        {editPetContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}
