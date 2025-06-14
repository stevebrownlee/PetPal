'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { getPetById, updatePet, deletePet } from '../../../services/petService';
import { getPetAppointments } from '../../../services/appointmentService';
import Navbar from '../../../components/Navbar';
import FeatureErrorBoundary from '../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Container, Grid, Badge, Heading, Text, Flex, Card, Button, Box, Tabs, Avatar, Dialog, IconButton } from '@radix-ui/themes';
import { FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

export default function PetDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;

  const [pet, setPet] = useState(null);
  const [petAppointments, setPetAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch pet details and appointments
    const fetchPetData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch pet appointments
        const appointmentsData = await getPetAppointments(petId);
        setPetAppointments(appointmentsData || []);
      } catch (err) {
        console.error('Error fetching pet data:', err);
        setError('Failed to load pet data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (petId) {
      fetchPetData();
    }
  }, [user, router, petId]);

  const handleEdit = () => {
    router.push(`/pets/${petId}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deletePet(petId);
      router.push('/pets');
    } catch (err) {
      console.error('Error deleting pet:', err);
      setError('Failed to delete pet. Please try again.');
      setIsDeleteDialogOpen(false);
    }
  };

  // Get status badge color for appointments
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Unknown';

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 'Unknown';

    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
    }

    return years === 1 ? '1 year' : `${years} years`;
  };

  const petDetailsContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        {isLoading ? (
          <Text>Loading pet details...</Text>
        ) : error ? (
          <Card>
            <Flex direction="column" align="center" gap="4" p="6">
              <Text color="red">{error}</Text>
              <Button onClick={() => router.push('/pets')}>Back to Pets</Button>
            </Flex>
          </Card>
        ) : pet ? (
          <Flex direction="column" gap="6">
            <Card>
              <Flex justify="between" align="start" p="4">
                <Flex gap="4" align="center">
                  <Avatar
                    size="6"
                    src={pet.imageUrl}
                    fallback={pet.name.charAt(0)}
                    radius="full"
                  />
                  <Box>
                    <Heading size="6">{pet.name}</Heading>
                    <Text size="2" color="gray">{pet.species} • {pet.breed}</Text>
                  </Box>
                </Flex>
                <Flex gap="2">
                  <IconButton variant="soft" onClick={handleEdit}>
                    <FiEdit2 />
                  </IconButton>
                  <IconButton
                    variant="soft"
                    color="red"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <FiTrash2 />
                  </IconButton>
                </Flex>
              </Flex>
            </Card>

            <Tabs.Root defaultValue="details">
              <Tabs.List>
                <Tabs.Trigger value="details">Details</Tabs.Trigger>
                <Tabs.Trigger value="appointments">Appointments</Tabs.Trigger>
                <Tabs.Trigger value="health">Health Records</Tabs.Trigger>
                <Tabs.Trigger value="vaccinations">Vaccinations</Tabs.Trigger>
                <Tabs.Trigger value="medications">Medications</Tabs.Trigger>
                <Tabs.Trigger value="weight">Weight History</Tabs.Trigger>
                <Tabs.Trigger value="feeding">Feeding Schedule</Tabs.Trigger>
              </Tabs.List>

              <Box pt="4">
                <Tabs.Content value="details">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Heading size="4">Pet Information</Heading>

                      <Grid columns="2" gap="4">
                        <InfoItem label="Species" value={pet.species} />
                        <InfoItem label="Breed" value={pet.breed || 'Not specified'} />
                        <InfoItem label="Birth Date" value={formatDate(pet.birthDate)} />
                        <InfoItem label="Age" value={calculateAge(pet.birthDate)} />
                        <InfoItem label="Gender" value={pet.gender || 'Not specified'} />
                        <InfoItem label="Color" value={pet.color || 'Not specified'} />
                        <InfoItem label="Weight" value={pet.weight ? `${pet.weight} ${pet.weightUnit || 'lbs'}` : 'Not specified'} />
                        <InfoItem label="Microchip" value={pet.microchipNumber || 'Not specified'} />
                      </Grid>

                      {pet.notes && (
                        <Box mt="2">
                          <Text size="2" weight="bold">Notes:</Text>
                          <Text size="2">{pet.notes}</Text>
                        </Box>
                      )}
                    </Flex>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="appointments">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Flex justify="between" align="center">
                        <Heading size="4">Appointments</Heading>
                        <Button size="2" onClick={() => router.push(`/appointments/add?petId=${petId}`)}>
                          Schedule Appointment
                        </Button>
                      </Flex>

                      {petAppointments.length === 0 ? (
                        <Text>No appointments found. Schedule an appointment to get started.</Text>
                      ) : (
                        <Flex direction="column" gap="3">
                          {petAppointments.map((appointment) => (
                            <Card key={appointment.id}>
                              <Flex gap="3" p="2">
                                <Box style={{ color: 'var(--accent-9)', fontSize: '1.5rem' }}>
                                  <FiCalendar />
                                </Box>
                                <Box style={{ flex: 1 }}>
                                  <Flex justify="between" align="start">
                                    <Box>
                                      <Text size="2" weight="bold">{appointment.reason}</Text>
                                      <Text size="1" color="gray">
                                        {formatDate(appointment.date)} • {appointment.time}
                                      </Text>
                                      {appointment.veterinarianName && (
                                        <Text size="1">Dr. {appointment.veterinarianName}</Text>
                                      )}
                                      {appointment.location && (
                                        <Text size="1">{appointment.location}</Text>
                                      )}
                                    </Box>
                                    <Flex direction="column" align="end">
                                      <Badge color={getStatusBadgeColor(appointment.status)}>
                                        {appointment.status || 'Scheduled'}
                                      </Badge>
                                      <Button
                                        size="1"
                                        variant="ghost"
                                        onClick={() => router.push(`/appointments/${appointment.id}`)}
                                      >
                                        View
                                      </Button>
                                    </Flex>
                                  </Flex>
                                </Box>
                              </Flex>
                            </Card>
                          ))}
                        </Flex>
                      )}
                    </Flex>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="health">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Flex justify="between" align="center">
                        <Heading size="4">Health Records</Heading>
                        <Flex gap="2">
                          <Button size="2" onClick={() => router.push(`/pets/${petId}/health-records`)}>
                            View All Records
                          </Button>
                          <Button size="2" onClick={() => router.push(`/pets/${petId}/health-records/add`)}>
                            Add Vet Visit
                          </Button>
                        </Flex>
                      </Flex>

                      {/* Brief summary of health records */}
                      <Text>View your pet's vet visit history and health records.</Text>
                    </Flex>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="vaccinations">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Flex justify="between" align="center">
                        <Heading size="4">Vaccinations</Heading>
                        <Flex gap="2">
                          <Button size="2" onClick={() => router.push(`/pets/${petId}/vaccinations`)}>
                            View All Vaccinations
                          </Button>
                          {user?.role === 'Veterinarian' && (
                            <Button size="2" onClick={() => router.push(`/pets/${petId}/vaccinations/add`)}>
                              Add Vaccination
                            </Button>
                          )}
                        </Flex>
                      </Flex>

                      {/* Brief summary of vaccinations */}
                      <Text>View your pet's vaccination history and upcoming due dates.</Text>
                    </Flex>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="medications">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Flex justify="between" align="center">
                        <Heading size="4">Medications</Heading>
                        <Flex gap="2">
                          <Button size="2" onClick={() => router.push(`/pets/${petId}/medications`)}>
                            View All Medications
                          </Button>
                          <Button size="2" onClick={() => router.push(`/pets/${petId}/medications/add`)}>
                            Add Medication
                          </Button>
                        </Flex>
                      </Flex>

                      {/* Brief summary of medications */}
                      <Text>Manage your pet's medications to keep track of dosages, schedules, and reminders.</Text>
                    </Flex>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="weight">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Flex justify="between" align="center">
                        <Heading size="4">Weight History</Heading>
                        <Flex gap="2">
                          <Button size="2" onClick={() => router.push(`/pets/${petId}/weight`)}>
                            View All Weight Records
                          </Button>
                          <Button size="2" onClick={() => router.push(`/pets/${petId}/weight/add`)}>
                            Add Weight Record
                          </Button>
                        </Flex>
                      </Flex>

                      {/* Brief summary of weight history */}
                      <Text>Track your pet's weight over time to monitor health and growth.</Text>
                    </Flex>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="feeding">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Flex justify="between" align="center">
                        <Heading size="4">Feeding Schedule</Heading>
                        <Flex gap="2">
                          <Button size="2" onClick={() => router.push(`/pets/${petId}/feeding`)}>
                            View Feeding Schedule
                          </Button>
                          <Button size="2" onClick={() => router.push(`/pets/${petId}/feeding/add`)}>
                            Add Feeding Time
                          </Button>
                        </Flex>
                      </Flex>

                      {/* Placeholder for feeding schedule */}
                      <Text>No feeding schedule found. Create a feeding schedule to get started.</Text>
                    </Flex>
                  </Card>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Flex>
        ) : (
          <Card>
            <Flex direction="column" align="center" gap="4" p="6">
              <Text>Pet not found.</Text>
              <Button onClick={() => router.push('/pets')}>Back to Pets</Button>
            </Flex>
          </Card>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Delete Pet</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete {pet?.name}? This action cannot be undone.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Cancel</Button>
            </Dialog.Close>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="PetDetails">
        {petDetailsContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}

// Helper component for displaying pet information
function InfoItem({ label, value }) {
  return (
    <Box>
      <Text size="2" weight="bold">{label}:</Text>
      <Text size="2">{value}</Text>
    </Box>
  );
}
