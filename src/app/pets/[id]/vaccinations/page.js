'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { getPetById } from '../../../../services/petService';
import { getPetVaccinations } from '../../../../services/vaccinationService';
import Navbar from '../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Badge, Select, IconButton, InfoCircledIcon } from '@radix-ui/themes';
import { FiFilter, FiArrowUp, FiArrowDown, FiInfo } from 'react-icons/fi';

export default function PetVaccinations() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [filteredVaccinations, setFilteredVaccinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'current', 'expired'
  const [sortBy, setSortBy] = useState('recordDate'); // 'description', 'recordDate', 'dueDate'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  useEffect(() => {
    // Fetch pet details and vaccinations
    const fetchData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch pet vaccinations
        const vaccinationsData = await getPetVaccinations(petId);
        setVaccinations(vaccinationsData || []);
        setFilteredVaccinations(vaccinationsData || []);
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
    let result = [...vaccinations];

    // Apply filter
    if (filter === 'current') {
      result = result.filter(vax => {
        const dueDate = vax.dueDate ? new Date(vax.dueDate) : null;
        return !dueDate || dueDate >= new Date();
      });
    } else if (filter === 'expired') {
      result = result.filter(vax => {
        const dueDate = vax.dueDate ? new Date(vax.dueDate) : null;
        return dueDate && dueDate < new Date();
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      if (sortBy === 'description') {
        valueA = a.description?.toLowerCase() || '';
        valueB = b.description?.toLowerCase() || '';
      } else if (sortBy === 'recordDate') {
        valueA = a.recordDate ? new Date(a.recordDate).getTime() : 0;
        valueB = b.recordDate ? new Date(b.recordDate).getTime() : 0;
      } else if (sortBy === 'dueDate') {
        valueA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        valueB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredVaccinations(result);
  }, [vaccinations, filter, sortBy, sortOrder]);

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  };

  const getVaccinationStatus = (vaccination) => {
    if (!vaccination.dueDate) return 'current';

    const dueDate = new Date(vaccination.dueDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (dueDate < now) {
      return 'expired';
    } else if (dueDate <= thirtyDaysFromNow) {
      return 'due-soon';
    } else {
      return 'current';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'current':
        return 'green';
      case 'due-soon':
        return 'yellow';
      case 'expired':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'current':
        return 'Current';
      case 'due-soon':
        return 'Due Soon';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const vaccinationsContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Flex justify="between" align="center">
              <Heading size="6">Vaccinations for {pet?.name || 'Pet'}</Heading>
              {user?.role === 'Veterinarian' && (
                <Button onClick={() => router.push(`/pets/${petId}/vaccinations/add`)}>
                  Add Vaccination
                </Button>
              )}
            </Flex>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {/* Information message for pet owners */}
            {user?.role !== 'Veterinarian' && (
              <Card style={{ backgroundColor: 'var(--accent-2)' }}>
                <Flex gap="2" p="2" align="center">
                  <Box style={{ color: 'var(--accent-9)' }}>
                    <FiInfo />
                  </Box>
                  <Text size="2">
                    Only veterinarians can add or modify vaccination records. Please contact your vet to update this information.
                  </Text>
                </Flex>
              </Card>
            )}

            {isLoading ? (
              <Text>Loading vaccinations...</Text>
            ) : (
              <>
                {/* Filters and Sorting */}
                <Flex gap="4" align="center">
                  <Flex align="center" gap="2">
                    <Text size="2">Filter:</Text>
                    <Select.Root value={filter} onValueChange={handleFilterChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="all">All Vaccinations</Select.Item>
                        <Select.Item value="current">Current Only</Select.Item>
                        <Select.Item value="expired">Expired Only</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>

                  <Flex align="center" gap="2">
                    <Text size="2">Sort by:</Text>
                    <Select.Root value={sortBy} onValueChange={handleSortChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="description">Name</Select.Item>
                        <Select.Item value="recordDate">Date Administered</Select.Item>
                        <Select.Item value="dueDate">Due Date</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <IconButton variant="ghost" onClick={toggleSortOrder}>
                      {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                    </IconButton>
                  </Flex>
                </Flex>

                {/* Vaccinations List */}
                {filteredVaccinations.length === 0 ? (
                  <Text>No vaccinations found. Contact your veterinarian to add vaccination records.</Text>
                ) : (
                  <Flex direction="column" gap="3">
                    {filteredVaccinations.map((vaccination) => {
                      const status = getVaccinationStatus(vaccination);
                      return (
                        <Card key={vaccination.id}>
                          <Flex justify="between" p="3">
                            <Flex direction="column" gap="1">
                              <Flex align="center" gap="2">
                                <Text weight="bold">{vaccination.description}</Text>
                                <Badge color={getStatusBadgeColor(status)}>
                                  {getStatusText(status)}
                                </Badge>
                              </Flex>
                              <Text size="2">
                                Administered: {formatDate(vaccination.recordDate)}
                              </Text>
                              <Text size="2">
                                Due: {formatDate(vaccination.dueDate)}
                              </Text>
                              {vaccination.veterinarianName && (
                                <Text size="2" color="gray">
                                  Administered by: Dr. {vaccination.veterinarianName}
                                </Text>
                              )}
                              {vaccination.notes && (
                                <Text size="2" color="gray">
                                  {vaccination.notes}
                                </Text>
                              )}
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
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="PetVaccinations">
        {vaccinationsContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}