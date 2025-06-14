'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../../services/petService';
import { getMedicationById, updateMedication } from '../../../../../../services/medicationService';
import ProtectedRoute from '../../../../../../components/ProtectedRoute';
import Navbar from '../../../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../../../components/FeatureErrorBoundary';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea, Checkbox } from '@radix-ui/themes';

export default function EditMedication() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;
  const medicationId = params.medicationId;

  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    dosageUnit: 'mg',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    reason: '',
    instructions: '',
    isOngoing: false,
    reminders: true,
    reminderTimes: ['08:00'],
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Common dosage units for selection
  const dosageUnits = [
    { value: 'mg', label: 'mg (milligram)' },
    { value: 'ml', label: 'ml (milliliter)' },
    { value: 'g', label: 'g (gram)' },
    { value: 'tablet', label: 'tablet' },
    { value: 'capsule', label: 'capsule' },
    { value: 'drop', label: 'drop' },
    { value: 'puff', label: 'puff' },
    { value: 'unit', label: 'unit' }
  ];

  // Common frequency options
  const frequencyOptions = [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'three_times_daily', label: 'Three times daily' },
    { value: 'four_times_daily', label: 'Four times daily' },
    { value: 'every_other_day', label: 'Every other day' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'as_needed', label: 'As needed (PRN)' },
    { value: 'custom', label: 'Custom' }
  ];

  // Check if user is authenticated and fetch pet and medication data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch medication details
        const medicationData = await getMedicationById(medicationId);

        // Format dates for form inputs
        const startDate = medicationData.startDate ? new Date(medicationData.startDate).toISOString().split('T')[0] : '';
        const endDate = medicationData.endDate ? new Date(medicationData.endDate).toISOString().split('T')[0] : '';
        const isOngoing = !medicationData.endDate;

        // Parse reminder times from the API response
        let reminderTimes = ['08:00'];
        if (medicationData.reminderTime) {
          // Handle single reminder time
          reminderTimes = [medicationData.reminderTime.substring(0, 5)]; // Extract HH:MM from time string
        } else if (medicationData.reminderTimes && Array.isArray(medicationData.reminderTimes)) {
          // Handle multiple reminder times if the API returns them as an array
          reminderTimes = medicationData.reminderTimes.map(time =>
            typeof time === 'string' ? time.substring(0, 5) : '08:00'
          );
        }

        // Set form data from medication
        setFormData({
          medicationName: medicationData.name || '',
          dosage: medicationData.dosage?.replace(/[a-zA-Z]/g, '').trim() || '',
          dosageUnit: extractDosageUnit(medicationData.dosage) || 'mg',
          frequency: medicationData.frequency || '',
          startDate,
          endDate,
          prescribedBy: medicationData.prescriber || '',
          reason: medicationData.reason || '',
          instructions: medicationData.instructions || '',
          isOngoing,
          reminders: medicationData.reminderEnabled || true,
          reminderTimes,
          notes: medicationData.notes || ''
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (petId && medicationId) {
      fetchData();
    }
  }, [user, router, petId, medicationId]);

  // Helper function to extract dosage unit from dosage string
  const extractDosageUnit = (dosageString) => {
    if (!dosageString) return 'mg';

    // Try to match common units
    for (const unit of dosageUnits) {
      if (dosageString.toLowerCase().includes(unit.value.toLowerCase())) {
        return unit.value;
      }
    }

    // Default to mg if no match
    return 'mg';
  };

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

  const handleReminderTimeChange = (index, value) => {
    const newReminderTimes = [...formData.reminderTimes];
    newReminderTimes[index] = value;
    setFormData(prev => ({
      ...prev,
      reminderTimes: newReminderTimes
    }));
  };

  const addReminderTime = () => {
    setFormData(prev => ({
      ...prev,
      reminderTimes: [...prev.reminderTimes, '12:00']
    }));
  };

  const removeReminderTime = (index) => {
    const newReminderTimes = formData.reminderTimes.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      reminderTimes: newReminderTimes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Prepare medication data
      const medicationData = {
        name: formData.medicationName,
        dosage: `${formData.dosage} ${formData.dosageUnit}`,
        frequency: formData.frequency,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.isOngoing ? null : (formData.endDate ? new Date(formData.endDate).toISOString() : null),
        prescriber: formData.prescribedBy,
        reason: formData.reason,
        instructions: formData.instructions,
        notes: formData.notes,
        reminderEnabled: formData.reminders,
        reminderFrequency: 'Daily', // Default to daily reminders
        reminderTime: formData.reminderTimes[0] // Use the first reminder time as the primary
      };

      // Call API to update medication
      await updateMedication(medicationId, medicationData);

      // Redirect back to medications list
      router.push(`/pets/${petId}/medications`);
    } catch (err) {
      console.error('Error updating medication:', err);
      setError('Failed to update medication. Please try again.');
      setIsSaving(false);
    }
  };

  const editMedicationContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Edit Medication for {pet?.name || 'Pet'}</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading medication details...</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="medicationName">
                      Medication Name*
                    </Text>
                    <TextField.Root
                      id="medicationName"
                      value={formData.medicationName}
                      onChange={handleChange}
                      placeholder="Enter medication name"
                      required
                    />
                  </Box>

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="dosage">
                        Dosage*
                      </Text>
                      <TextField.Root
                        id="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        placeholder="Enter dosage amount"
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="dosageUnit">
                        Unit
                      </Text>
                      <Select.Root
                        value={formData.dosageUnit}
                        onValueChange={(value) => handleSelectChange('dosageUnit', value)}
                      >
                        <Select.Trigger id="dosageUnit" />
                        <Select.Content>
                          {dosageUnits.map(unit => (
                            <Select.Item key={unit.value} value={unit.value}>
                              {unit.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="frequency">
                      Frequency*
                    </Text>
                    <Select.Root
                      value={formData.frequency}
                      onValueChange={(value) => handleSelectChange('frequency', value)}
                    >
                      <Select.Trigger id="frequency" placeholder="Select frequency" />
                      <Select.Content>
                        {frequencyOptions.map(option => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  {formData.frequency === 'custom' && (
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="customFrequency">
                        Custom Frequency
                      </Text>
                      <TextField.Root
                        id="customFrequency"
                        value={formData.customFrequency || ''}
                        onChange={handleChange}
                        placeholder="Describe custom frequency (e.g., every 8 hours)"
                      />
                    </Box>
                  )}

                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="startDate">
                        Start Date*
                      </Text>
                      <TextField.Root
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </Box>

                    <Box>
                      <Flex direction="column" gap="1">
                        <Flex align="center" gap="2">
                          <input
                            type="checkbox"
                            id="isOngoing"
                            checked={formData.isOngoing}
                            onChange={handleChange}
                          />
                          <Text as="label" size="2" htmlFor="isOngoing">
                            Ongoing Medication
                          </Text>
                        </Flex>

                        {!formData.isOngoing && (
                          <>
                            <Text as="label" size="2" mb="1" htmlFor="endDate">
                              End Date
                            </Text>
                            <TextField.Root
                              id="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={handleChange}
                            />
                          </>
                        )}
                      </Flex>
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="prescribedBy">
                      Prescribed By
                    </Text>
                    <TextField.Root
                      id="prescribedBy"
                      value={formData.prescribedBy}
                      onChange={handleChange}
                      placeholder="Enter name of prescriber"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="reason">
                      Reason for Medication
                    </Text>
                    <TextField.Root
                      id="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Enter reason for medication"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="instructions">
                      Administration Instructions
                    </Text>
                    <TextArea
                      id="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="Enter instructions for administering medication"
                    />
                  </Box>

                  <Box>
                    <Flex align="center" gap="2" mb="2">
                      <input
                        type="checkbox"
                        id="reminders"
                        checked={formData.reminders}
                        onChange={handleChange}
                      />
                      <Text as="label" size="2" htmlFor="reminders">
                        Set Reminders
                      </Text>
                    </Flex>

                    {formData.reminders && (
                      <Box>
                        <Text size="2" mb="2">Reminder Times:</Text>
                        {formData.reminderTimes.map((time, index) => (
                          <Flex key={index} gap="2" mb="2" align="center">
                            <TextField.Root
                              type="time"
                              value={time}
                              onChange={(e) => handleReminderTimeChange(index, e.target.value)}
                              style={{ flexGrow: 1 }}
                            />
                            {formData.reminderTimes.length > 1 && (
                              <Button
                                type="button"
                                size="1"
                                variant="soft"
                                color="red"
                                onClick={() => removeReminderTime(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </Flex>
                        ))}
                        <Button
                          type="button"
                          size="1"
                          variant="soft"
                          onClick={addReminderTime}
                        >
                          Add Reminder Time
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="notes">
                      Additional Notes
                    </Text>
                    <TextArea
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
                    />
                  </Box>

                  <Flex gap="3" mt="4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Update Medication'}
                    </Button>
                    <Button
                      type="button"
                      variant="soft"
                      onClick={() => router.push(`/pets/${petId}/medications`)}
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
      <FeatureErrorBoundary featureName="EditMedication">
        {editMedicationContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}