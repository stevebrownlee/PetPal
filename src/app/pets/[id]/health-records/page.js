'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { getPetById } from '../../../../services/petService';
import { getPetHealthRecords, deleteHealthRecord } from '../../../../services/healthRecordService';
import Navbar from '../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Badge, Select, Dialog, IconButton } from '@radix-ui/themes';
import { FiEdit2, FiTrash2, FiFilter, FiArrowUp, FiArrowDown, FiCalendar } from 'react-icons/fi';

export default function PetHealthRecords() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'recent', 'older'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'reason', 'veterinarian'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  useEffect(() => {
    // Fetch pet details and health records
    const fetchData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch pet health records
        const recordsData = await getPetHealthRecords(petId);
        setHealthRecords(recordsData || []);
        setFilteredRecords(recordsData || []);
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
    let result = [...healthRecords];

    // Apply filter
    if (filter === 'recent') {
      // Filter records from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      result = result.filter(record => new Date(record.visitDate) >= threeMonthsAgo);
    } else if (filter === 'older') {
      // Filter records older than 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      result = result.filter(record => new Date(record.visitDate) < threeMonthsAgo);
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      if (sortBy === 'date') {
        valueA = new Date(a.visitDate).getTime();
        valueB = new Date(b.visitDate).getTime();
      } else if (sortBy === 'reason') {
        valueA = a.reason?.toLowerCase() || '';
        valueB = b.reason?.toLowerCase() || '';
      } else if (sortBy === 'veterinarian') {
        valueA = a.veterinarianName?.toLowerCase() || '';
        valueB = b.veterinarianName?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredRecords(result);
  }, [healthRecords, filter, sortBy, sortOrder]);

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleViewDetails = (recordId) => {
    router.push(`/pets/${petId}/health-records/${recordId}`);
  };

  const handleDelete = (record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      await deleteHealthRecord(recordToDelete.id);
      setHealthRecords(healthRecords.filter(record => record.id !== recordToDelete.id));
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    } catch (err) {
      console.error('Error deleting health record:', err);
      setError('Failed to delete health record. Please try again.');
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  };

  const healthRecordsContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Flex justify="between" align="center">
              <Heading size="6">Health Records for {pet?.name || 'Pet'}</Heading>
              <Button onClick={() => router.push(`/pets/${petId}/health-records/add`)}>
                Add Vet Visit
              </Button>
            </Flex>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading health records...</Text>
            ) : (
              <>
                {/* Filters and Sorting */}
                <Flex gap="4" align="center">
                  <Flex align="center" gap="2">
                    <Text size="2">Filter:</Text>
                    <Select.Root value={filter} onValueChange={handleFilterChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="all">All Records</Select.Item>
                        <Select.Item value="recent">Last 3 Months</Select.Item>
                        <Select.Item value="older">Older Records</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>

                  <Flex align="center" gap="2">
                    <Text size="2">Sort by:</Text>
                    <Select.Root value={sortBy} onValueChange={handleSortChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="date">Date</Select.Item>
                        <Select.Item value="reason">Reason</Select.Item>
                        <Select.Item value="veterinarian">Veterinarian</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <IconButton variant="ghost" onClick={toggleSortOrder}>
                      {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                    </IconButton>
                  </Flex>
                </Flex>

                {/* Health Records List */}
                {filteredRecords.length === 0 ? (
                  <Text>No health records found. Add a vet visit to get started.</Text>
                ) : (
                  <Flex direction="column" gap="3">
                    {filteredRecords.map((record) => (
                      <Card key={record.id}>
                        <Flex gap="3" p="3">
                          <Box style={{ color: 'var(--accent-9)', fontSize: '1.5rem' }}>
                            <FiCalendar />
                          </Box>
                          <Box style={{ flex: 1 }}>
                            <Flex justify="between" align="start">
                              <Box>
                                <Text size="2" weight="bold">{record.reason}</Text>
                                <Text size="1" color="gray">
                                  {formatDate(record.visitDate)}
                                </Text>
                                {record.veterinarianName && (
                                  <Text size="1">Dr. {record.veterinarianName}</Text>
                                )}
                                {record.clinicName && (
                                  <Text size="1">{record.clinicName}</Text>
                                )}
                                {record.diagnosis && (
                                  <Text size="1" style={{ marginTop: '8px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Diagnosis:</span> {record.diagnosis}
                                  </Text>
                                )}
                              </Box>
                              <Flex direction="column" align="end" gap="2">
                                <Button
                                  size="1"
                                  onClick={() => handleViewDetails(record.id)}
                                >
                                  View Details
                                </Button>
                                <IconButton
                                  variant="soft"
                                  color="red"
                                  onClick={() => handleDelete(record)}
                                >
                                  <FiTrash2 />
                                </IconButton>
                              </Flex>
                            </Flex>
                          </Box>
                        </Flex>
                      </Card>
                    ))}
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
          <Dialog.Title>Delete Health Record</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete this health record from {formatDate(recordToDelete?.visitDate)}? This action cannot be undone.
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
      <FeatureErrorBoundary featureName="PetHealthRecords">
        {healthRecordsContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}