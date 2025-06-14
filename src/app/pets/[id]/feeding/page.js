'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { getPetById } from '../../../../services/petService';
import { getPetFeedingSchedules, deleteFeedingSchedule } from '../../../../services/feedingService';
import Navbar from '../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Badge, Select, Dialog, IconButton } from '@radix-ui/themes';
import { FiEdit2, FiTrash2, FiFilter, FiArrowUp, FiArrowDown, FiClock } from 'react-icons/fi';

export default function PetFeedingSchedules() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [feedingSchedules, setFeedingSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('feedingTime'); // 'feedingTime', 'foodType'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  useEffect(() => {
    // Fetch pet details and feeding schedules
    const fetchData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch pet feeding schedules
        const schedulesData = await getPetFeedingSchedules(petId);
        setFeedingSchedules(schedulesData || []);
        setFilteredSchedules(schedulesData || []);
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
    let result = [...feedingSchedules];

    // Apply filter
    if (filter === 'active') {
      result = result.filter(schedule => schedule.isActive);
    } else if (filter === 'inactive') {
      result = result.filter(schedule => !schedule.isActive);
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      if (sortBy === 'feedingTime') {
        valueA = a.feedingTime || '';
        valueB = b.feedingTime || '';
      } else if (sortBy === 'foodType') {
        valueA = a.foodType?.toLowerCase() || '';
        valueB = b.foodType?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredSchedules(result);
  }, [feedingSchedules, filter, sortBy, sortOrder]);

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleEdit = (scheduleId) => {
    router.push(`/pets/${petId}/feeding/edit/${scheduleId}`);
  };

  const handleDelete = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await deleteFeedingSchedule(scheduleToDelete.id);
      setFeedingSchedules(feedingSchedules.filter(schedule => schedule.id !== scheduleToDelete.id));
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    } catch (err) {
      console.error('Error deleting feeding schedule:', err);
      setError('Failed to delete feeding schedule. Please try again.');
      setDeleteDialogOpen(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'No time set';

    try {
      // Parse the time string (assuming format like "08:00:00")
      const [hours, minutes] = timeString.split(':');

      // Create a date object and set the time
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));

      // Format the time in 12-hour format
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString; // Return the original string if parsing fails
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive ? 'green' : 'gray';
  };

  const feedingSchedulesContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Flex justify="between" align="center">
              <Heading size="6">Feeding Schedule for {pet?.name || 'Pet'}</Heading>
              <Button onClick={() => router.push(`/pets/${petId}/feeding/add`)}>
                Add Feeding Time
              </Button>
            </Flex>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading feeding schedules...</Text>
            ) : (
              <>
                {/* Filters and Sorting */}
                <Flex gap="4" align="center">
                  <Flex align="center" gap="2">
                    <Text size="2">Filter:</Text>
                    <Select.Root value={filter} onValueChange={handleFilterChange}>
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="all">All Schedules</Select.Item>
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
                        <Select.Item value="feedingTime">Feeding Time</Select.Item>
                        <Select.Item value="foodType">Food Type</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <IconButton variant="ghost" onClick={toggleSortOrder}>
                      {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                    </IconButton>
                  </Flex>
                </Flex>

                {/* Feeding Schedules List */}
                {filteredSchedules.length === 0 ? (
                  <Text>No feeding schedules found. Add a feeding time to get started.</Text>
                ) : (
                  <Flex direction="column" gap="3">
                    {filteredSchedules.map((schedule) => (
                      <Card key={schedule.id}>
                        <Flex justify="between" p="3">
                          <Flex direction="column" gap="1">
                            <Flex align="center" gap="2">
                              <FiClock />
                              <Text weight="bold">{formatTime(schedule.feedingTime)}</Text>
                              <Badge color={getStatusBadgeColor(schedule.isActive)}>
                                {schedule.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </Flex>
                            <Text size="2">Food: {schedule.foodType}</Text>
                            <Text size="2">Portion: {schedule.portion}</Text>
                            {schedule.notes && (
                              <Text size="2" color="gray">
                                Notes: {schedule.notes}
                              </Text>
                            )}
                          </Flex>
                          <Flex gap="2" align="start">
                            <IconButton variant="soft" onClick={() => handleEdit(schedule.id)}>
                              <FiEdit2 />
                            </IconButton>
                            <IconButton
                              variant="soft"
                              color="red"
                              onClick={() => handleDelete(schedule)}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </Flex>
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
          <Dialog.Title>Delete Feeding Schedule</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete the feeding time at {scheduleToDelete ? formatTime(scheduleToDelete.feedingTime) : ''}? This action cannot be undone.
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
      <FeatureErrorBoundary featureName="PetFeedingSchedules">
        {feedingSchedulesContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}