'use client';

import { useState } from 'react';
import { Box, Text, Button, Flex, Card, TextField, Select } from '@radix-ui/themes';
import { FiUpload, FiX, FiFile, FiPaperclip } from 'react-icons/fi';

/**
 * A reusable component for document uploading
 *
 * @param {Object} props Component props
 * @param {Function} props.onDocumentsChange Callback when documents are selected or removed
 * @param {Array} props.initialDocuments Initial documents (if any)
 * @param {string} props.label Label for the upload field
 * @param {boolean} props.required Whether the field is required
 * @param {boolean} props.isUploading Whether an upload is in progress
 * @param {string} props.uploadProgress Upload progress message
 */
export default function DocumentUpload({
  onDocumentsChange,
  initialDocuments = [],
  label = 'Documents',
  required = false,
  isUploading = false,
  uploadProgress = ''
}) {
  const [documents, setDocuments] = useState(initialDocuments || []);
  const [dragActive, setDragActive] = useState(false);
  const [documentMetadata, setDocumentMetadata] = useState([]);

  // Document type options
  const documentTypes = [
    { value: 'labResults', label: 'Lab Results' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'xray', label: 'X-Ray' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'other', label: 'Other' }
  ];

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Process the selected files
  const processFiles = (files) => {
    const newDocuments = [...documents, ...files];
    setDocuments(newDocuments);

    // Initialize metadata for new files
    const newMetadata = [...documentMetadata];
    files.forEach(() => {
      newMetadata.push({ documentType: 'other', description: '' });
    });
    setDocumentMetadata(newMetadata);

    // Call the parent component's handler
    if (onDocumentsChange) {
      onDocumentsChange(newDocuments, newMetadata);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Handle removing a document
  const handleRemoveDocument = (index) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);

    const newMetadata = [...documentMetadata];
    newMetadata.splice(index, 1);
    setDocumentMetadata(newMetadata);

    // Call the parent component's handler
    if (onDocumentsChange) {
      onDocumentsChange(newDocuments, newMetadata);
    }
  };

  // Handle metadata changes
  const handleMetadataChange = (index, field, value) => {
    const newMetadata = [...documentMetadata];
    if (!newMetadata[index]) {
      newMetadata[index] = {};
    }
    newMetadata[index][field] = value;
    setDocumentMetadata(newMetadata);

    // Call the parent component's handler
    if (onDocumentsChange) {
      onDocumentsChange(documents, newMetadata);
    }
  };

  // Get file icon based on file type
  const getFileIcon = (file) => {
    const fileType = file.type || '';
    if (fileType.includes('image')) {
      return <FiFile style={{ marginRight: '8px' }} />;
    } else if (fileType.includes('pdf')) {
      return <FiFile style={{ marginRight: '8px' }} />;
    } else {
      return <FiPaperclip style={{ marginRight: '8px' }} />;
    }
  };

  return (
    <Box>
      <Text as="label" size="2" mb="1" htmlFor="documentUpload">
        {label}{required && '*'}
      </Text>

      <Box
        onDragEnter={handleDrag}
        style={{
          position: 'relative',
          marginTop: '8px'
        }}
      >
        <Box
          style={{
            border: `1px dashed ${dragActive ? 'var(--accent-9)' : 'var(--gray-6)'}`,
            borderRadius: 'var(--radius-2)',
            padding: '16px',
            textAlign: 'center',
            backgroundColor: dragActive ? 'var(--accent-2)' : 'transparent',
            transition: 'all 0.2s ease',
            marginBottom: '16px'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="documentUpload"
            multiple
            onChange={handleFileChange}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
            disabled={isUploading}
          />
          <Flex direction="column" align="center" gap="2" py="4">
            <FiUpload size={24} />
            <Text size="2">
              {dragActive ? 'Drop documents here' : 'Drag and drop documents or click to browse'}
            </Text>
            <Text size="1" color="gray">
              Supported formats: PDF, DOC, DOCX, JPG, PNG
            </Text>
            {isUploading && (
              <Text size="2" color="blue">
                {uploadProgress || 'Uploading...'}
              </Text>
            )}
          </Flex>
        </Box>

        {/* Document List */}
        {documents.length > 0 && (
          <Card>
            <Box p="3">
              <Text size="2" weight="bold" mb="2">Selected Documents:</Text>
              <Flex direction="column" gap="3">
                {documents.map((doc, index) => (
                  <Card key={index}>
                    <Flex p="3" direction="column" gap="2">
                      <Flex justify="between" align="center">
                        <Flex align="center">
                          {getFileIcon(doc)}
                          <Text size="2">{doc.name}</Text>
                        </Flex>
                        <Button
                          size="1"
                          variant="soft"
                          color="red"
                          onClick={() => handleRemoveDocument(index)}
                          disabled={isUploading}
                        >
                          <FiX />
                        </Button>
                      </Flex>

                      {/* Document Metadata */}
                      <Flex gap="3" mt="1">
                        <Box style={{ flex: 1 }}>
                          <Text as="label" size="1" mb="1" htmlFor={`docType-${index}`}>
                            Document Type
                          </Text>
                          <Select.Root
                            value={documentMetadata[index]?.documentType || 'other'}
                            onValueChange={(value) => handleMetadataChange(index, 'documentType', value)}
                            disabled={isUploading}
                          >
                            <Select.Trigger id={`docType-${index}`} />
                            <Select.Content>
                              {documentTypes.map((type) => (
                                <Select.Item key={type.value} value={type.value}>
                                  {type.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        </Box>
                        <Box style={{ flex: 2 }}>
                          <Text as="label" size="1" mb="1" htmlFor={`docDesc-${index}`}>
                            Description
                          </Text>
                          <TextField.Root
                            id={`docDesc-${index}`}
                            placeholder="Brief description"
                            value={documentMetadata[index]?.description || ''}
                            onChange={(e) => handleMetadataChange(index, 'description', e.target.value)}
                            disabled={isUploading}
                          />
                        </Box>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  );
}