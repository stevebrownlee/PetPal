'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../services/petService';
import { getHealthRecordById, deleteHealthRecord } from '../../../../../services/healthRecordService';
import { getDocumentsForHealthRecord } from '../../../../../services/documentService';
import Navbar from '../../../../../components/Navbar';
import FeatureErrorBoundary from '../../../../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import DocumentList from '../../../../../components/DocumentList';
import { Container, Heading, Text, Flex, Card, Button, Box, Badge, Dialog, IconButton } from '@radix-ui/themes';
import { FiEdit2, FiTrash2, FiArrowLeft, FiCalendar, FiPaperclip } from 'react-icons/fi';

export default function HealthRecordDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;
  const recordId = params.recordId;

  const [pet, setPet] = useState(null);
  const [healthRecord, setHealthRecord] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch pet details and health record
    const fetchData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch health record details
        const recordData = await getHealthRecordById(recordId);
        setHealthRecord(recordData);

        // Fetch documents for this health record
        const documentsData = await getDocumentsForHealthRecord(recordId);
        setDocuments(documentsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (petId && recordId) {
      fetchData();
    }
  }, [user, router, petId, recordId]);

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  // Handle document deletion
  const handleDocumentDeleted = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const confirmDelete = async () => {
    try {
      await deleteHealthRecord(recordId);
      router.push(`/pets/${petId}/health-records`);
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

  const healthRecordDetailContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="4" p="4">
            <Flex justify="between" align="center">
              <Flex align="center" gap="2">
                <IconButton variant="ghost" onClick={() => router.push(`/pets/${petId}/health-records`)}>
                  <FiArrowLeft />
                </IconButton>
                <Heading size="6">Vet Visit Details</Heading>
              </Flex>
              <Flex gap="2">
                <IconButton
                  variant="soft"
                  onClick={() => router.push(`/pets/${petId}/health-records/${recordId}/edit`)}
                  title="Edit"
                >
                  <FiEdit2 />
                </IconButton>
                <IconButton
                  variant="soft"
                  color="red"
                  onClick={handleDelete}
                  title="Delete"
                >
                  <FiTrash2 />
                </IconButton>
              </Flex>
            </Flex>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading health record details...</Text>
            ) : healthRecord ? (
              <Flex direction="column" gap="4">
                <Card>
                  <Flex gap="3" p="3">
                    <Box style={{ color: 'var(--accent-9)', fontSize: '1.5rem' }}>
                      <FiCalendar />
                    </Box>
                    <Box>
                      <Heading size="4">{healthRecord.reason}</Heading>
                      <Text size="2" color="gray">
                        {formatDate(healthRecord.visitDate)}
                      </Text>
                    </Box>
                  </Flex>
                </Card>

                <Card>
                  <Flex direction="column" gap="3" p="4">
                    <Heading size="4">Visit Information</Heading>

                    <InfoItem label="Pet" value={pet?.name || 'Unknown'} />
                    <InfoItem label="Veterinarian" value={healthRecord.veterinarianName || 'Not specified'} />
                    <InfoItem label="Clinic" value={healthRecord.clinicName || 'Not specified'} />
                    <InfoItem label="Reason for Visit" value={healthRecord.reason} />

                    {healthRecord.diagnosis && (
                      <Box>
                        <Text size="2" weight="bold">Diagnosis:</Text>
                        <Text size="2">{healthRecord.diagnosis}</Text>
                      </Box>
                    )}

                    {healthRecord.treatment && (
                      <Box>
                        <Text size="2" weight="bold">Treatment:</Text>
                        <Text size="2">{healthRecord.treatment}</Text>
                      </Box>
                    )}

                    {healthRecord.medications && (
                      <Box>
                        <Text size="2" weight="bold">Medications Prescribed:</Text>
                        <Text size="2">{healthRecord.medications}</Text>
                      </Box>
                    )}

                    {healthRecord.followUpNeeded && (
                      <Box>
                        <Text size="2" weight="bold">Follow-up:</Text>
                        <Text size="2">
                          {healthRecord.followUpDate ? `Scheduled for ${formatDate(healthRecord.followUpDate)}` : 'Required (date not specified)'}
                        </Text>
                      </Box>
                    )}

                    {healthRecord.notes && (
                      <Box>
                        <Text size="2" weight="bold">Additional Notes:</Text>
                        <Text size="2">{healthRecord.notes}</Text>
                      </Box>
                    )}
                  </Flex>
                </Card>

                {/* Documents section */}
                <Card>
                  <Flex direction="column" gap="3" p="4">
                    <Heading size="4">Documents</Heading>
                    {documents.length > 0 ? (
                      <DocumentList
                        documents={documents}
                        onDocumentDeleted={handleDocumentDeleted}
                      />
                    ) : (
                      <Text size="2">No documents available for this visit.</Text>
                    )}
                  </Flex>
                </Card>

                <Flex gap="3" mt="2">
                  <Button onClick={() => router.push(`/pets/${petId}/health-records`)}>
                    Back to Health Records
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <Card>
                <Flex direction="column" align="center" gap="4" p="6">
                  <Text>Health record not found.</Text>
                  <Button onClick={() => router.push(`/pets/${petId}/health-records`)}>
                    Back to Health Records
                  </Button>
                </Flex>
              </Card>
            )}
          </Flex>
        </Card>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Delete Health Record</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete this health record? This action cannot be undone.
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
      <FeatureErrorBoundary featureName="HealthRecordDetail">
        {healthRecordDetailContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}

// Helper component for displaying information
function InfoItem({ label, value }) {
  return (
    <Box>
      <Text size="2" weight="bold">{label}:</Text>
      <Text size="2">{value}</Text>
    </Box>
  );
}