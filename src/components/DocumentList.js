'use client';

import { useState } from 'react';
import { Box, Text, Button, Flex, Card, Dialog, IconButton } from '@radix-ui/themes';
import { FiDownload, FiTrash2, FiFile, FiFileText, FiImage, FiPaperclip } from 'react-icons/fi';
import { deleteDocument, getDocumentDownloadUrl } from '../services/documentService';

/**
 * A component for displaying a list of documents with download and delete options
 *
 * @param {Object} props Component props
 * @param {Array} props.documents Array of document objects to display
 * @param {Function} props.onDocumentDeleted Callback when a document is deleted
 * @param {boolean} props.readOnly If true, hide delete buttons
 */
export default function DocumentList({
  documents = [],
  onDocumentDeleted,
  readOnly = false
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Handle document deletion
  const handleDelete = (document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  // Confirm document deletion
  const confirmDelete = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    setError('');

    try {
      await deleteDocument(documentToDelete.id);

      // Call the callback if provided
      if (onDocumentDeleted) {
        onDocumentDeleted(documentToDelete.id);
      }

      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle document download
  const handleDownload = (document) => {
    const downloadUrl = getDocumentDownloadUrl(document.id);
    window.open(downloadUrl, '_blank');
  };

  // Get file icon based on file type
  const getFileIcon = (document) => {
    const fileType = document.fileType || '';

    if (fileType.includes('image')) {
      return <FiImage size={20} />;
    } else if (fileType.includes('pdf')) {
      return <FiFileText size={20} />;
    } else if (fileType.includes('doc') || fileType.includes('word')) {
      return <FiFile size={20} />;
    } else {
      return <FiPaperclip size={20} />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Get document type label
  const getDocumentTypeLabel = (type) => {
    const types = {
      'labResults': 'Lab Results',
      'prescription': 'Prescription',
      'xray': 'X-Ray',
      'invoice': 'Invoice',
      'other': 'Other'
    };

    return types[type] || 'Document';
  };

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <Box p="4">
          <Text size="2">No documents available.</Text>
        </Box>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Box p="4">
          <Flex direction="column" gap="3">
            {documents.map((document) => (
              <Card key={document.id}>
                <Flex p="3" justify="between" align="center">
                  <Flex gap="3" align="center">
                    <Box style={{ color: 'var(--accent-9)' }}>
                      {getFileIcon(document)}
                    </Box>
                    <Box>
                      <Text size="2" weight="bold">{document.fileName}</Text>
                      <Flex gap="2" align="center">
                        <Text size="1" color="gray">
                          {getDocumentTypeLabel(document.documentType)}
                        </Text>
                        <Text size="1" color="gray">
                          {formatFileSize(document.fileSize)}
                        </Text>
                        {document.uploadedAt && (
                          <Text size="1" color="gray">
                            Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </Flex>
                      {document.description && (
                        <Text size="1" style={{ marginTop: '4px' }}>
                          {document.description}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                  <Flex gap="2">
                    <IconButton
                      size="1"
                      variant="soft"
                      onClick={() => handleDownload(document)}
                      title="Download"
                    >
                      <FiDownload />
                    </IconButton>
                    {!readOnly && (
                      <IconButton
                        size="1"
                        variant="soft"
                        color="red"
                        onClick={() => handleDelete(document)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </IconButton>
                    )}
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content>
          <Dialog.Title>Delete Document</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete this document? This action cannot be undone.
          </Dialog.Description>

          {error && (
            <Text color="red" size="2" mb="3">
              {error}
            </Text>
          )}

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" disabled={isDeleting}>Cancel</Button>
            </Dialog.Close>
            <Button color="red" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}