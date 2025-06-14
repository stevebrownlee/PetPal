'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { getPetById } from '../../../../../../services/petService';
import { getHealthRecordById, updateHealthRecordWithDocuments } from '../../../../../../services/healthRecordService';
import { getDocumentsForHealthRecord } from '../../../../../../services/documentService';
import Navbar from '../../../../../../components/Navbar';
import ProtectedRoute from '../../../../../../components/ProtectedRoute';
import FeatureErrorBoundary from '../../../../../../components/FeatureErrorBoundary';
import DocumentUpload from '../../../../../../components/DocumentUpload';
import { Container, Heading, Text, Flex, Card, TextField, Button, Box, Grid, Select, TextArea } from '@radix-ui/themes';

export default function EditVetVisit() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id;
  const recordId = params.recordId;

  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    visitDate: '',
    veterinarianName: '',
    clinicName: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    followUpNeeded: false,
    followUpDate: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentMetadata, setDocumentMetadata] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);

  // Check if user is authenticated and fetch pet and health record data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pet details
        const petData = await getPetById(petId);
        setPet(petData);

        // Fetch health record details
        const recordData = await getHealthRecordById(recordId);

        // Format dates for form inputs
        const formattedRecord = {
          ...recordData,
          visitDate: recordData.visitDate ? new Date(recordData.visitDate).toISOString().split('T')[0] : '',
          followUpDate: recordData.followUpDate ? new Date(recordData.followUpDate).toISOString().split('T')[0] : ''
        };

        setFormData(formattedRecord);

        // Fetch documents for this health record
        const documentsData = await getDocumentsForHealthRecord(recordId);
        setExistingDocuments(documentsData || []);
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

  const handleDocumentsChange = (newDocuments, newMetadata) => {
    setDocuments(newDocuments);
    setDocumentMetadata(newMetadata);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Prepare health record data
      const healthRecordData = {
        ...formData,
        petId,
        recordType: 'VET_VISIT',
        // Convert dates to ISO format
        visitDate: new Date(formData.visitDate).toISOString(),
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null
      };

      // Call API to update health record with documents
      if (documents.length > 0) {
        await updateHealthRecordWithDocuments(recordId, healthRecordData, documents, documentMetadata);
      } else {
        await updateHealthRecordWithDocuments(recordId, healthRecordData, [], []);
      }

      // Redirect back to health record detail page
      router.push(`/pets/${petId}/health-records/${recordId}`);
    } catch (err) {
      console.error('Error updating vet visit:', err);
      setError('Failed to update vet visit. Please try again.');
      setIsSaving(false);
    }
  };

  const editVetVisitContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Card>
          <Flex direction="column" gap="5" p="4">
            <Heading size="6" align="center">Edit Vet Visit for {pet?.name || 'Pet'}</Heading>

            {error && (
              <Text color="red" size="2">
                {error}
              </Text>
            )}

            {isLoading ? (
              <Text>Loading data...</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Grid columns="2" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="visitDate">
                        Visit Date*
                      </Text>
                      <TextField.Root
                        id="visitDate"
                        type="date"
                        value={formData.visitDate}
                        onChange={handleChange}
                        required
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="clinicName">
                        Clinic Name
                      </Text>
                      <TextField.Root
                        id="clinicName"
                        value={formData.clinicName}
                        onChange={handleChange}
                        placeholder="Enter clinic name"
                      />
                    </Box>
                  </Grid>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="veterinarianName">
                      Veterinarian Name
                    </Text>
                    <TextField.Root
                      id="veterinarianName"
                      value={formData.veterinarianName}
                      onChange={handleChange}
                      placeholder="Enter veterinarian name"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="reason">
                      Reason for Visit*
                    </Text>
                    <TextField.Root
                      id="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Enter reason for visit"
                      required
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="diagnosis">
                      Diagnosis
                    </Text>
                    <TextArea
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      placeholder="Enter diagnosis"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="treatment">
                      Treatment
                    </Text>
                    <TextArea
                      id="treatment"
                      value={formData.treatment}
                      onChange={handleChange}
                      placeholder="Enter treatment details"
                    />
                  </Box>

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="medications">
                      Medications Prescribed
                    </Text>
                    <TextArea
                      id="medications"
                      value={formData.medications}
                      onChange={handleChange}
                      placeholder="Enter medications prescribed"
                    />
                  </Box>

                  <Box>
                    <Flex align="center" gap="2">
                      <input
                        type="checkbox"
                        id="followUpNeeded"
                        checked={formData.followUpNeeded}
                        onChange={handleChange}
                      />
                      <Text as="label" size="2" htmlFor="followUpNeeded">
                        Follow-up Needed
                      </Text>
                    </Flex>
                  </Box>

                  {formData.followUpNeeded && (
                    <Box>
                      <Text as="label" size="2" mb="1" htmlFor="followUpDate">
                        Follow-up Date
                      </Text>
                      <TextField.Root
                        id="followUpDate"
                        type="date"
                        value={formData.followUpDate}
                        onChange={handleChange}
                      />
                    </Box>
                  )}

                  {/* Existing Documents */}
                  {existingDocuments.length > 0 && (
                    <Box>
                      <Text size="2" weight="bold" mb="2">Existing Documents:</Text>
                      <Card>
                        <Box p="3">
                          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                            {existingDocuments.map((doc) => (
                              <li key={doc.id} style={{ marginBottom: '4px' }}>
                                <Text size="2">
                                  {doc.fileName} - {doc.documentType || 'Document'}
                                  {doc.description && ` (${doc.description})`}
                                </Text>
                              </li>
                            ))}
                          </ul>
                          <Text size="1" color="gray" mt="2">
                            Note: Existing documents cannot be removed here. You can delete them from the health record details page.
                          </Text>
                        </Box>
                      </Card>
                    </Box>
                  )}

                  {/* Document Upload */}
                  <DocumentUpload
                    onDocumentsChange={handleDocumentsChange}
                    initialDocuments={documents}
                    label="Upload Additional Documents"
                    isUploading={isSaving}
                  />

                  <Box>
                    <Text as="label" size="2" mb="1" htmlFor="notes">
                      Additional Notes
                    </Text>
                    <TextArea
                      id="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
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
                      onClick={() => router.push(`/pets/${petId}/health-records/${recordId}`)}
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
      <FeatureErrorBoundary featureName="EditVetVisit">
        {editVetVisitContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}