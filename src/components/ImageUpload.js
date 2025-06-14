'use client';

import { useState } from 'react';
import { Box, Text, Button, Flex, Card } from '@radix-ui/themes';
import { FiUpload, FiX } from 'react-icons/fi';

/**
 * A reusable component for image uploading with preview
 *
 * @param {Object} props Component props
 * @param {Function} props.onImageChange Callback when image is selected
 * @param {string} props.previewUrl Initial preview URL (if any)
 * @param {string} props.label Label for the upload field
 * @param {boolean} props.required Whether the field is required
 * @param {boolean} props.isUploading Whether an upload is in progress
 * @param {string} props.uploadProgress Upload progress message
 * @param {Function} props.onClearImage Callback to clear the selected image
 */
export default function ImageUpload({
  onImageChange,
  previewUrl,
  label = 'Image',
  required = false,
  isUploading = false,
  uploadProgress = '',
  onClearImage
}) {
  const [dragActive, setDragActive] = useState(false);
  const [localPreview, setLocalPreview] = useState(previewUrl || '');

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Process the selected file
  const processFile = (file) => {
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Call the parent component's handler
    if (onImageChange) {
      onImageChange(file);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle clearing the image
  const handleClear = () => {
    setLocalPreview('');
    if (onClearImage) {
      onClearImage();
    }
  };

  // Use either the local preview or the provided preview URL
  const displayPreview = localPreview || previewUrl;

  return (
    <Box>
      <Text as="label" size="2" mb="1" htmlFor="imageUpload">
        {label}{required && '*'}
      </Text>

      <Box
        onDragEnter={handleDrag}
        style={{
          position: 'relative',
          marginTop: '8px'
        }}
      >
        {!displayPreview ? (
          <Box
            style={{
              border: `1px dashed ${dragActive ? 'var(--accent-9)' : 'var(--gray-6)'}`,
              borderRadius: 'var(--radius-2)',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: dragActive ? 'var(--accent-2)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
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
                {dragActive ? 'Drop image here' : 'Drag and drop an image or click to browse'}
              </Text>
              {isUploading && (
                <Text size="2" color="blue">
                  {uploadProgress || 'Uploading...'}
                </Text>
              )}
            </Flex>
          </Box>
        ) : (
          <Card style={{ position: 'relative' }}>
            <img
              src={displayPreview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                display: 'block',
                margin: '0 auto',
                borderRadius: 'var(--radius-2)'
              }}
            />
            {!isUploading && (
              <Button
                size="1"
                variant="soft"
                color="red"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px'
                }}
                onClick={handleClear}
              >
                <FiX />
              </Button>
            )}
            {isUploading && (
              <Box
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '0',
                  right: '0',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '4px',
                  borderRadius: '0 0 var(--radius-2) var(--radius-2)'
                }}
              >
                <Text size="1" color="white">
                  {uploadProgress || 'Uploading...'}
                </Text>
              </Box>
            )}
          </Card>
        )}
      </Box>
    </Box>
  );
}