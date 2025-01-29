'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  TimePicker 
} from '@/components/ui/time-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { NotificationService } from '@/lib/notification-service';
import { 
  SyncPlatform 
} from '@/lib/notification-sync-service';

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enablePushNotifications: true,
    enableInAppNotifications: true,
    
    scholarshipNotifications: true,
    apprenticeshipNotifications: true,
    academicUpdateNotifications: true,
    performanceReviewNotifications: true,
    
    dailyDigestEnabled: false,
    weeklyDigestEnabled: false,
    
    quietHoursStart: null,
    quietHoursEnd: null
  });

  const [syncPreferences, setSyncPreferences] = useState({
    enabledPlatforms: [
      SyncPlatform.WEB, 
      SyncPlatform.MOBILE
    ],
    syncFrequency: 'REAL_TIME', // Options: REAL_TIME, PERIODIC, MANUAL
    syncOnWiFiOnly: true,
    maxNotificationsToSync: 100
  });

  const notificationService = new NotificationService();

  useEffect(() => {
    // Fetch current user's notification preferences
    const fetchPreferences = async () => {
      try {
        // TODO: Implement actual preference retrieval
        // const currentPreferences = await notificationService.getNotificationPreferences();
        // setPreferences(currentPreferences);
      } catch (error) {
        toast.error('Failed to load notification preferences');
      }
    };

    fetchPreferences();
  }, []);

  const handlePreferenceToggle = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTimeChange = (type: 'start' | 'end', time: Date | null) => {
    setPreferences(prev => ({
      ...prev,
      [`quietHours${type === 'start' ? 'Start' : 'End'}`]: time
    }));
  };

  const handleSyncPreferencesUpdate = async () => {
    try {
      // TODO: Implement sync preferences update in backend
      await notificationService.updateSyncPreferences(
        'current-user-id', 
        syncPreferences
      );
      toast.success('Sync preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update sync preferences');
    }
  };

  const savePreferences = async () => {
    try {
      await notificationService.updateNotificationPreferences(
        'current-user-id', // Replace with actual user ID
        preferences
      );
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update notification preferences');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Notification Preferences
      </h2>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch
              checked={preferences.enableEmailNotifications}
              onCheckedChange={(value) => 
                handlePreferenceToggle('enableEmailNotifications', value)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>SMS Notifications</Label>
            <Switch
              checked={preferences.enableSmsNotifications}
              onCheckedChange={(value) => 
                handlePreferenceToggle('enableSmsNotifications', value)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Push Notifications</Label>
            <Switch
              checked={preferences.enablePushNotifications}
              onCheckedChange={(value) => 
                handlePreferenceToggle('enablePushNotifications', value)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>In-App Notifications</Label>
            <Switch
              checked={preferences.enableInAppNotifications}
              onCheckedChange={(value) => 
                handlePreferenceToggle('enableInAppNotifications', value)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Scholarship Notifications</Label>
            <Switch
              checked={preferences.scholarshipNotifications}
              onCheckedChange={(value) => 
                handlePreferenceToggle('scholarshipNotifications', value)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Apprenticeship Notifications</Label>
            <Switch
              checked={preferences.apprenticeshipNotifications}
              onCheckedChange={(value) => 
                handlePreferenceToggle('apprenticeshipNotifications', value)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Academic Update Notifications</Label>
            <Switch
              checked={preferences.academicUpdateNotifications}
              onCheckedChange={(value) => 
                handlePreferenceToggle('academicUpdateNotifications', value)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Performance Review Notifications</Label>
            <Switch
              checked={preferences.performanceReviewNotifications}
              onCheckedChange={(value) => 
                handlePreferenceToggle('performanceReviewNotifications', value)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Digest Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Digest Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daily Digest</Label>
            <Switch
              checked={preferences.dailyDigestEnabled}
              onCheckedChange={(value) => 
                handlePreferenceToggle('dailyDigestEnabled', value)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Weekly Digest</Label>
            <Switch
              checked={preferences.weeklyDigestEnabled}
              onCheckedChange={(value) => 
                handlePreferenceToggle('weeklyDigestEnabled', value)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Quiet Hours Start</Label>
            <TimePicker
              value={preferences.quietHoursStart}
              onChange={(time) => handleTimeChange('start', time)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Quiet Hours End</Label>
            <TimePicker
              value={preferences.quietHoursEnd}
              onChange={(time) => handleTimeChange('end', time)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cross-Platform Sync */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Platform Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Sync Platforms</Label>
            <div className="flex space-x-2 mt-2">
              {Object.values(SyncPlatform).map(platform => (
                <Button
                  key={platform}
                  variant={
                    syncPreferences.enabledPlatforms.includes(platform) 
                      ? 'default' 
                      : 'outline'
                  }
                  onClick={() => {
                    setSyncPreferences(prev => ({
                      ...prev,
                      enabledPlatforms: prev.enabledPlatforms.includes(platform)
                        ? prev.enabledPlatforms.filter(p => p !== platform)
                        : [...prev.enabledPlatforms, platform]
                    }));
                  }}
                >
                  {platform}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Sync Frequency</Label>
            <Select
              value={syncPreferences.syncFrequency}
              onValueChange={(value) => 
                setSyncPreferences(prev => ({
                  ...prev,
                  syncFrequency: value
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Sync Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REAL_TIME">Real-Time</SelectItem>
                <SelectItem value="PERIODIC">Periodic</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Sync Only on WiFi</Label>
            <Switch
              checked={syncPreferences.syncOnWiFiOnly}
              onCheckedChange={(value) => 
                setSyncPreferences(prev => ({
                  ...prev,
                  syncOnWiFiOnly: value
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Max Notifications to Sync</Label>
            <Input
              type="number"
              value={syncPreferences.maxNotificationsToSync}
              onChange={(e) => 
                setSyncPreferences(prev => ({
                  ...prev,
                  maxNotificationsToSync: parseInt(e.target.value)
                }))
              }
              min={10}
              max={500}
              className="w-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Preferences */}
      <div className="flex justify-end">
        <Button onClick={() => {
          savePreferences();
          handleSyncPreferencesUpdate();
        }}>
          Save All Preferences
        </Button>
      </div>
    </div>
  );
}
