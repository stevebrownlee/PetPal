'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getNotificationSettings, updateNotificationSettings } from '../../services/settingsService';
import Navbar from '../../components/Navbar';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Container, Heading, Text, Flex, Card, Button, Box, Tabs, Switch, RadioGroup, Separator } from '@radix-ui/themes';

export default function Settings() {
  const { user } = useAuth();
  const { themeSettings: globalThemeSettings, updateTheme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    appointmentReminders: true,
    medicationReminders: true,
    vaccinationReminders: true,
    weightReminders: false,
    feedingReminders: false,
    reminderLeadTime: 24,
  });

  // Local theme settings state (will be synced with global theme context)
  const [localThemeSettings, setLocalThemeSettings] = useState({
    theme: 'light',
    accentColor: 'blue',
    fontSize: 'medium',
  });

  // Sync local theme settings with global theme settings
  useEffect(() => {
    if (globalThemeSettings) {
      setLocalThemeSettings(prev => ({
        ...prev,
        ...globalThemeSettings
      }));
    }
  }, [globalThemeSettings]);

  // Fetch user settings when component mounts
  useEffect(() => {
    // Fetch user settings
    const fetchSettings = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Fetch notification settings from API
        const settings = await getNotificationSettings();
        setNotificationSettings(settings);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again.');
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleNotificationChange = (id, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [id]: typeof value === 'boolean' ? value : value
    }));
  };

  const handleThemeChange = (id, value) => {
    setLocalThemeSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveNotifications = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      // Save notification settings to API
      const response = await updateNotificationSettings(notificationSettings);
      setSuccess('Notification settings saved successfully');

      // Update local state with the response from the server
      if (response) {
        setNotificationSettings(response);
      }
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Failed to save notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      // Update the theme in the global context (which will also save to API)
      const result = await updateTheme(localThemeSettings);

      if (result) {
        setSuccess('Theme settings saved successfully');
      } else {
        setError('Failed to save theme settings. Please try again.');
      }
    } catch (err) {
      console.error('Error saving theme settings:', err);
      setError('Failed to save theme settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const settingsContent = (
    <>
      <Navbar />
      <Container size="2" py="9">
        <Flex direction="column" gap="6">
          <Heading size="6">Settings</Heading>

          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}

          {success && (
            <Text color="green" size="2">
              {success}
            </Text>
          )}

          {isLoading ? (
            <Text>Loading settings...</Text>
          ) : (
            <Tabs.Root defaultValue="notifications">
              <Tabs.List>
                <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
                <Tabs.Trigger value="appearance">Appearance</Tabs.Trigger>
                <Tabs.Trigger value="account">Account</Tabs.Trigger>
                <Tabs.Trigger value="privacy">Privacy</Tabs.Trigger>
              </Tabs.List>

              <Box pt="4">
                <Tabs.Content value="notifications">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Heading size="4">Notification Settings</Heading>

                      <Flex direction="column" gap="3">
                        <SettingItem
                          label="Email Notifications"
                          description="Receive notifications via email"
                          control={
                            <Switch
                              checked={notificationSettings.emailNotificationsEnabled}
                              onCheckedChange={(checked) => handleNotificationChange('emailNotificationsEnabled', checked)}
                            />
                          }
                        />

                        <SettingItem
                          label="Push Notifications"
                          description="Receive push notifications on your device"
                          control={
                            <Switch
                              checked={notificationSettings.pushNotificationsEnabled}
                              onCheckedChange={(checked) => handleNotificationChange('pushNotificationsEnabled', checked)}
                            />
                          }
                        />

                        <Separator size="4" />
                        <Heading size="3">Reminder Types</Heading>

                        <SettingItem
                          label="Vet Visit Reminders"
                          description="Get reminders for upcoming vet appointments"
                          control={
                            <Switch
                              checked={notificationSettings.appointmentReminders}
                              onCheckedChange={(checked) => handleNotificationChange('appointmentReminders', checked)}
                            />
                          }
                        />

                        <SettingItem
                          label="Medication Reminders"
                          description="Get reminders for medication doses"
                          control={
                            <Switch
                              checked={notificationSettings.medicationReminders}
                              onCheckedChange={(checked) => handleNotificationChange('medicationReminders', checked)}
                            />
                          }
                        />

                        <SettingItem
                          label="Vaccination Reminders"
                          description="Get reminders for upcoming vaccinations"
                          control={
                            <Switch
                              checked={notificationSettings.vaccinationReminders}
                              onCheckedChange={(checked) => handleNotificationChange('vaccinationReminders', checked)}
                            />
                          }
                        />

                        <SettingItem
                          label="Weight Check Reminders"
                          description="Get reminders to record your pet's weight"
                          control={
                            <Switch
                              checked={notificationSettings.weightReminders}
                              onCheckedChange={(checked) => handleNotificationChange('weightReminders', checked)}
                            />
                          }
                        />

                        <SettingItem
                          label="Feeding Reminders"
                          description="Get reminders for feeding times"
                          control={
                            <Switch
                              checked={notificationSettings.feedingReminders}
                              onCheckedChange={(checked) => handleNotificationChange('feedingReminders', checked)}
                            />
                          }
                        />

                        <Separator size="4" />
                        <Heading size="3">Reminder Settings</Heading>

                        <Box>
                          <Text size="2" weight="bold" mb="2">Reminder Lead Time</Text>
                          <Text size="2" color="gray" mb="2">How many hours in advance should we send reminders?</Text>
                          <RadioGroup.Root
                            value={notificationSettings.reminderLeadTime.toString()}
                            onValueChange={(value) => handleNotificationChange('reminderLeadTime', parseInt(value, 10))}
                          >
                            <Flex direction="column" gap="2">
                              <Text as="label" size="2">
                                <Flex gap="2" align="center">
                                  <RadioGroup.Item value="0" /> Same day (0 hours)
                                </Flex>
                              </Text>
                              <Text as="label" size="2">
                                <Flex gap="2" align="center">
                                  <RadioGroup.Item value="24" /> 1 day before (24 hours)
                                </Flex>
                              </Text>
                              <Text as="label" size="2">
                                <Flex gap="2" align="center">
                                  <RadioGroup.Item value="72" /> 3 days before (72 hours)
                                </Flex>
                              </Text>
                              <Text as="label" size="2">
                                <Flex gap="2" align="center">
                                  <RadioGroup.Item value="168" /> 1 week before (168 hours)
                                </Flex>
                              </Text>
                            </Flex>
                          </RadioGroup.Root>
                        </Box>
                      </Flex>

                      <Flex justify="end" mt="4">
                        <Button onClick={handleSaveNotifications} disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Save Notification Settings'}
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="appearance">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Heading size="4">Appearance Settings</Heading>

                      <Box>
                        <Text size="2" weight="bold" mb="2">Theme</Text>
                        <RadioGroup.Root
                          value={localThemeSettings.theme}
                          onValueChange={(value) => handleThemeChange('theme', value)}
                        >
                          <Flex direction="column" gap="2">
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="light" /> Light
                              </Flex>
                            </Text>
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="dark" /> Dark
                              </Flex>
                            </Text>
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="system" /> System Default
                              </Flex>
                            </Text>
                          </Flex>
                        </RadioGroup.Root>
                      </Box>

                      <Box>
                        <Text size="2" weight="bold" mb="2">Accent Color</Text>
                        <RadioGroup.Root
                          value={localThemeSettings.accentColor}
                          onValueChange={(value) => handleThemeChange('accentColor', value)}
                        >
                          <Flex wrap="wrap" gap="2">
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="blue" />
                                <Box style={{ width: '20px', height: '20px', backgroundColor: 'var(--blue-9)', borderRadius: 'var(--radius-1)' }} />
                                Blue
                              </Flex>
                            </Text>
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="green" />
                                <Box style={{ width: '20px', height: '20px', backgroundColor: 'var(--green-9)', borderRadius: 'var(--radius-1)' }} />
                                Green
                              </Flex>
                            </Text>
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="purple" />
                                <Box style={{ width: '20px', height: '20px', backgroundColor: 'var(--purple-9)', borderRadius: 'var(--radius-1)' }} />
                                Purple
                              </Flex>
                            </Text>
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="orange" />
                                <Box style={{ width: '20px', height: '20px', backgroundColor: 'var(--orange-9)', borderRadius: 'var(--radius-1)' }} />
                                Orange
                              </Flex>
                            </Text>
                          </Flex>
                        </RadioGroup.Root>
                      </Box>

                      <Box>
                        <Text size="2" weight="bold" mb="2">Font Size</Text>
                        <RadioGroup.Root
                          value={localThemeSettings.fontSize}
                          onValueChange={(value) => handleThemeChange('fontSize', value)}
                        >
                          <Flex direction="column" gap="2">
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="small" /> Small
                              </Flex>
                            </Text>
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="medium" /> Medium
                              </Flex>
                            </Text>
                            <Text as="label" size="2">
                              <Flex gap="2" align="center">
                                <RadioGroup.Item value="large" /> Large
                              </Flex>
                            </Text>
                          </Flex>
                        </RadioGroup.Root>
                      </Box>

                      <Flex justify="end" mt="4">
                        <Button onClick={handleSaveTheme} disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Save Appearance Settings'}
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="account">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Heading size="4">Account Settings</Heading>
                      <Text>Account settings will be implemented here.</Text>

                      <Flex gap="3" mt="4">
                        <Button variant="soft" onClick={() => router.push('/profile')}>
                          Edit Profile
                        </Button>
                        <Button variant="soft" onClick={() => router.push('/change-password')}>
                          Change Password
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                </Tabs.Content>

                <Tabs.Content value="privacy">
                  <Card>
                    <Flex direction="column" gap="4" p="4">
                      <Heading size="4">Privacy Settings</Heading>
                      <Text>Privacy settings will be implemented here.</Text>
                    </Flex>
                  </Card>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          )}
        </Flex>
      </Container>
    </>
  );

  return (
    <ProtectedRoute>
      <FeatureErrorBoundary featureName="Settings">
        {settingsContent}
      </FeatureErrorBoundary>
    </ProtectedRoute>
  );
}

// Helper component for settings items
function SettingItem({ label, description, control }) {
  return (
    <Flex justify="between" align="center">
      <Box>
        <Text size="2" weight="bold">{label}</Text>
        {description && <Text size="2" color="gray">{description}</Text>}
      </Box>
      {control}
    </Flex>
  );
}