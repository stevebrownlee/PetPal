'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { getPetById } from '../../../../services/petService';
import { getPetMedications, deleteMedication } from '../../../../services/medicationService';
import Navbar from '../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Badge, Select, Dialog, IconButton } from '@radix-ui/themes';
import { FiEdit2, FiTrash2, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function PetMedications() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'startDate', 'endDate'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState(null);

  useEffect(() => {
    // Fetch pet details and medications
    const fetchData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch pet medications
        const medicationsData = await getPetMedications(petId);
        setMedications(medicationsData || []);
        setFilteredMedications(medicationsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (petId) {
      fetchData();
    }
  }, [user, router, petId]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...medications];

    // Apply filter
    if (filter === 'active') {
      result = result.filter(med => {
        const endDate = med.endDate ? new Date(med.endDate) : null;
        return !endDate || endDate >= new Date();
      });
    } else if (filter === 'inactive') {
      result = result.filter(med => {
        const endDate = med.endDate ? new Date(med.endDate) : null;
        return endDate && endDate < new Date();
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      if (sortBy === 'name') {
        valueA = a.name?.toLowerCase() || '';
        valueB = b.name?.toLowerCase() || '';
      } else if (sortBy === 'startDate') {
        valueA = a.startDate ? new Date(a.startDate).getTime() : 0;
        valueB = b.startDate ? new Date(b.startDate).getTime() : 0;
      } else if (sortBy === 'endDate') {
        valueA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        valueB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredMedications(result);
  }, [medications, filter, sortBy, sortOrder]);

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleEdit = (medicationId) => {
    router.push(`/pets/${petId}/medications/${medicationId}/edit`);
  };

  const handleDelete = (medication) => {
    setMedicationToDelete(medication);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!medicationToDelete) return;

    try {
      await deleteMedication(medicationToDelete.id);
      setMedications(medications.filter(med => med.id !== medicationToDelete.id));
      setDeleteDialogOpen(false);
      setMedicationToDelete(null);
    } catch (err) {
      console.error('Error deleting medication:', err);
      setError('Failed to delete medication. Please try again.');
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Ongoing';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  };

  const getMedicationStatus = (medication) => {
    if (!medication.endDate) return 'active';

    const endDate = new Date(medication.endDate);
    const now = new Date();

    return endDate >= now ? 'active' : 'inactive';
  };

  const getStatusBadgeColor = (status) => {
    return status === 'active' ? 'green' : 'gray';
  };

  const medicationsContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Flex justify="between" align="center">
              <Heading size="6">Medications for {pet?.name || 'Pet'}</Heading>
              <Button onClick={() => router.push(`/pets/${petId}/medications/add`)}>
                Add Medication
              </Button>
            </Flex>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading medications...</Text>
            ) : (
              <>
                {/* Filters and Sorting */}
                <Flex gap="4" align="center">
                  <Flex align="center" gap="2">
                    <Text size="2">Filter:</Text>
                    <Select.Root value={filter} onValueChange={handleFilterChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="all">All Medications</Select.Item>
                        <Select.Item value="active">Active Only</Select.Item>
                        <Select.Item value="inactive">Inactive Only</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>

                  <Flex align="center" gap="2">
                    <Text size="2">Sort by:</Text>
                    <Select.Root value={sortBy} onValueChange={handleSortChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="name">Name</Select.Item>
                        <Select.Item value="startDate">Start Date</Select.Item>
                        <Select.Item value="endDate">End Date</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <IconButton variant="ghost" onClick={toggleSortOrder}>
                      {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                    </IconButton>
                  </Flex>
                </Flex>

                {/* Medications List */}
                {filteredMedications.length === 0 ? (
                  <Text>No medications found. Add a medication to get started.</Text>
                ) : (
                  <Flex direction="column" gap="3">
                    {filteredMedications.map((medication) => {
                      const status = getMedicationStatus(medication);
                      return (
                        <Card key={medication.id}>
                          <Flex justify="between" p="3">
                            <Flex direction="column" gap="1">
                              <Flex align="center" gap="2">
                                <Text weight="bold">{medication.name}</Text>
                                <Badge color={getStatusBadgeColor(status)}>
                                  {status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                              </Flex>
                              <Text size="2">{medication.dosage} {medication.frequency}</Text>
                              <Text size="2">
                                {formatDate(medication.startDate)} - {formatDate(medication.endDate)}
                              </Text>
                              {medication.instructions && (
                                <Text size="2" color="gray">
                                  {medication.instructions}
                                </Text>
                              )}
                            </Flex>
                            <Flex gap="2" align="start">
                              <IconButton variant="soft" onClick={() => handleEdit(medication.id)}>
                                <FiEdit2 />
                              </IconButton>
                              <IconButton
                                variant="soft"
                                color="red"
                                onClick={() => handleDelete(medication)}
                              >
                                <FiTrash2 />
                              </IconButton>
                            </Flex>
                          </Flex>
                        </Card>
                      );
                    })}
                  </Flex>
                )}
              </>
            )}
          </Flex>
        </Card>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Delete Medication</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete {medicationToDelete?.name}? This action cannot be undone.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Cancel</Button>
            </Dialog.Close>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="PetMedications">
        {medicationsContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}