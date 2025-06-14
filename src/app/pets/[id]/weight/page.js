'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { getPetById } from '../../../../services/petService';
import { getPetWeights, getPetWeightHistory, calculateWeightStats, deleteWeight } from '../../../../services/weightService';
import Navbar from '../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Grid, Badge, Dialog, IconButton, TextField, Select } from '@radix-ui/themes';
import { FiEdit2, FiTrash2, FiFilter, FiArrowUp, FiArrowDown, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function PetWeightHistory() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;
  const chartRef = useRef(null);

  const [pet, setPet] = useState(null);
  const [weights, setWeights] = useState([]);
  const [filteredWeights, setFilteredWeights] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [weightToDelete, setWeightToDelete] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [stats, setStats] = useState({
    current: null,
    min: null,
    max: null,
    average: null,
    trend: 'stable'
  });

  useEffect(() => {
    // Fetch pet details and weight records
    const fetchData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch pet weight records
        const weightsData = await getPetWeights(petId);
        setWeights(weightsData || []);
        setFilteredWeights(weightsData || []);

        // Fetch weight history for graph
        const historyData = await getPetWeightHistory(petId);
        setWeightHistory(historyData || []);

        // Calculate statistics
        const calculatedStats = calculateWeightStats(weightsData);
        setStats(calculatedStats);
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

  // Apply sorting
  useEffect(() => {
    let result = [...weights];

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      if (sortBy === 'date') {
        valueA = new Date(a.date).getTime();
        valueB = new Date(b.date).getTime();
      } else if (sortBy === 'weight') {
        valueA = a.weightValue;
        valueB = b.weightValue;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredWeights(result);
  }, [weights, sortBy, sortOrder]);

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = (weight) => {
    setWeightToDelete(weight);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!weightToDelete) return;

    try {
      await deleteWeight(weightToDelete.id);

      // Update local state
      const updatedWeights = weights.filter(w => w.id !== weightToDelete.id);
      setWeights(updatedWeights);

      // Recalculate stats
      const calculatedStats = calculateWeightStats(updatedWeights);
      setStats(calculatedStats);

      // Fetch updated weight history for graph
      const historyData = await getPetWeightHistory(petId);
      setWeightHistory(historyData || []);

      setDeleteDialogOpen(false);
      setWeightToDelete(null);
    } catch (err) {
      console.error('Error deleting weight record:', err);
      setError('Failed to delete weight record. Please try again.');
      setDeleteDialogOpen(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const { id, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const applyDateFilter = async () => {
    try {
      setIsLoading(true);

      // Format dates for API
      const startDate = dateRange.startDate ? new Date(dateRange.startDate).toISOString() : null;
      const endDate = dateRange.endDate ? new Date(dateRange.endDate).toISOString() : null;

      // Fetch filtered weight history
      const historyData = await getPetWeightHistory(petId, startDate, endDate);
      setWeightHistory(historyData || []);

      // Filter weights for the list
      let filtered = [...weights];
      if (dateRange.startDate) {
        const start = new Date(dateRange.startDate);
        filtered = filtered.filter(w => new Date(w.date) >= start);
      }
      if (dateRange.endDate) {
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999); // End of day
        filtered = filtered.filter(w => new Date(w.date) <= end);
      }

      setFilteredWeights(filtered);

      // Recalculate stats for filtered data
      const calculatedStats = calculateWeightStats(filtered);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error applying date filter:', err);
      setError('Failed to apply date filter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDateFilter = async () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });

    try {
      setIsLoading(true);

      // Reset to all weights
      setFilteredWeights(weights);

      // Fetch all weight history
      const historyData = await getPetWeightHistory(petId);
      setWeightHistory(historyData || []);

      // Recalculate stats for all data
      const calculatedStats = calculateWeightStats(weights);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error resetting filter:', err);
      setError('Failed to reset filter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  };

  // Prepare chart data
  const chartData = {
    labels: weightHistory.map(record => formatDate(record.date)),
    datasets: [
      {
        label: 'Weight',
        data: weightHistory.map(record => record.weightValue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${pet?.name || 'Pet'}'s Weight History`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const record = weightHistory[context.dataIndex];
            return `Weight: ${record.weightValue} ${record.weightUnit || 'lbs'}`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: weightHistory[0]?.weightUnit || 'lbs'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'increasing':
        return <FiTrendingUp color="red" />;
      case 'decreasing':
        return <FiTrendingDown color="green" />;
      default:
        return <FiMinus color="gray" />;
    }
  };

  const weightHistoryContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Flex justify="between" align="center">
              <Heading size="6">Weight History for {pet?.name || 'Pet'}</Heading>
              <Button onClick={() => router.push(`/pets/${petId}/weight/add`)}>
                Add Weight Record
              </Button>
            </Flex>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading weight history...</Text>
            ) : (
              <>
                {/* Statistics Panel */}
                <Card>
                  <Flex direction="column" gap="2" p="3">
                    <Heading size="4">Weight Statistics</Heading>
                    <Grid columns="5" gap="3">
                      <Box>
                        <Text size="2" weight="bold">Current</Text>
                        <Text size="3">{stats.current ? `${stats.current} ${weightHistory[0]?.weightUnit || 'lbs'}` : 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text size="2" weight="bold">Minimum</Text>
                        <Text size="3">{stats.min ? `${stats.min.toFixed(1)} ${weightHistory[0]?.weightUnit || 'lbs'}` : 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text size="2" weight="bold">Maximum</Text>
                        <Text size="3">{stats.max ? `${stats.max.toFixed(1)} ${weightHistory[0]?.weightUnit || 'lbs'}` : 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text size="2" weight="bold">Average</Text>
                        <Text size="3">{stats.average ? `${stats.average.toFixed(1)} ${weightHistory[0]?.weightUnit || 'lbs'}` : 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text size="2" weight="bold">Trend</Text>
                        <Flex align="center" gap="1">
                          <Text size="3" style={{ textTransform: 'capitalize' }}>{stats.trend}</Text>
                          {getTrendIcon()}
                        </Flex>
                      </Box>
                    </Grid>
                  </Flex>
                </Card>

                {/* Date Range Filter */}
                <Card>
                  <Flex direction="column" gap="3" p="3">
                    <Heading size="4">Date Range Filter</Heading>
                    <Flex gap="3" align="end">
                      <Box>
                        <Text as="label" size="2" mb="1" htmlFor="startDate">
                          Start Date
                        </Text>
                        <TextField.Root
                          id="startDate"
                          type="date"
                          value={dateRange.startDate}
                          onChange={handleDateRangeChange}
                        />
                      </Box>
                      <Box>
                        <Text as="label" size="2" mb="1" htmlFor="endDate">
                          End Date
                        </Text>
                        <TextField.Root
                          id="endDate"
                          type="date"
                          value={dateRange.endDate}
                          onChange={handleDateRangeChange}
                        />
                      </Box>
                      <Button onClick={applyDateFilter}>Apply Filter</Button>
                      <Button variant="soft" onClick={resetDateFilter}>Reset</Button>
                    </Flex>
                  </Flex>
                </Card>

                {/* Weight Chart */}
                <Card>
                  <Flex direction="column" gap="3" p="3">
                    <Heading size="4">Weight Trend</Heading>
                    {weightHistory.length === 0 ? (
                      <Text>No weight records found to display chart.</Text>
                    ) : (
                      <Box style={{ height: '300px' }}>
                        <Line ref={chartRef} data={chartData} options={chartOptions} />
                      </Box>
                    )}
                  </Flex>
                </Card>

                {/* Sorting Controls */}
                <Flex align="center" gap="2">
                  <Text size="2">Sort by:</Text>
                  <Select.Root value={sortBy} onValueChange={handleSortChange}>
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="date">Date</Select.Item>
                      <Select.Item value="weight">Weight</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <IconButton variant="ghost" onClick={toggleSortOrder}>
                    {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                  </IconButton>
                </Flex>

                {/* Weight Records List */}
                {filteredWeights.length === 0 ? (
                  <Text>No weight records found. Add a weight record to get started.</Text>
                ) : (
                  <Flex direction="column" gap="3">
                    {filteredWeights.map((weight) => (
                      <Card key={weight.id}>
                        <Flex justify="between" p="3">
                          <Flex direction="column" gap="1">
                            <Flex align="center" gap="2">
                              <Text weight="bold">{weight.weightValue} {weight.weightUnit}</Text>
                              <Badge color="blue">
                                {formatDate(weight.date)}
                              </Badge>
                            </Flex>
                            {weight.notes && (
                              <Text size="2" color="gray">
                                {weight.notes}
                              </Text>
                            )}
                          </Flex>
                          <Flex gap="2" align="start">
                            <IconButton
                              variant="soft"
                              color="red"
                              onClick={() => handleDelete(weight)}
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
          <Dialog.Title>Delete Weight Record</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete this weight record from {formatDate(weightToDelete?.date)}? This action cannot be undone.
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
      <FeatureErrorBoundary featureName="PetWeightHistory">
        {weightHistoryContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}