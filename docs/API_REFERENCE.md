# PetPal API Reference Guide

This document provides a comprehensive reference for all available endpoints in the PetPal API.

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [Pet Endpoints](#pet-endpoints)
- [Health Record Endpoints](#health-record-endpoints)
- [Vaccination Endpoints](#vaccination-endpoints)
- [Medication Endpoints](#medication-endpoints)
- [Weight Endpoints](#weight-endpoints)
- [Feeding Schedule Endpoints](#feeding-schedule-endpoints)
- [Appointment Endpoints](#appointment-endpoints)
- [Care Provider Endpoints](#care-provider-endpoints)
- [Settings Endpoints](#settings-endpoints)
- [Dashboard Endpoints](#dashboard-endpoints)
- [Export Endpoints](#export-endpoints)
- [Testing the API](#testing-the-api)
- [Status Codes](#status-codes)
- [Authentication Notes](#authentication-notes)

## Authentication Endpoints

### Register a New User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response**: User details with 201 Created status

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: User details with authentication cookie

### Logout
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Authentication**: Required
- **Response**: 200 OK

## Pet Endpoints

### Get All Pets (Admin Only)
- **URL**: `/pets`
- **Method**: `GET`
- **Authentication**: Required (Admin role)
- **Response**: Array of all pets

### Get Current User's Pets
- **URL**: `/user/pets`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Array of pets owned by the current user

### Get Pet by ID
- **URL**: `/pets/{id}`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Pet details

### Create New Pet
- **URL**: `/pets`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "Fluffy",
    "species": "Cat",
    "breed": "Persian",
    "dateOfBirth": "2020-01-15T00:00:00Z",
    "weight": 4.5,
    "color": "White",
    "imageUrl": "https://example.com/fluffy.jpg",
    "microchipNumber": "123456789012345"
  }
  ```
- **Response**: Created pet details with 201 Created status

### Update Pet
- **URL**: `/pets/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Primary pet owner or Admin)
- **Request Body**:
  ```json
  {
    "name": "Fluffy",
    "species": "Cat",
    "breed": "Persian",
    "dateOfBirth": "2020-01-15T00:00:00Z",
    "weight": 5.0,
    "color": "White",
    "imageUrl": "https://example.com/fluffy.jpg",
    "microchipNumber": "123456789012345"
  }
  ```
- **Response**: Updated pet details

### Delete Pet
- **URL**: `/pets/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Primary pet owner or Admin)
- **Response**: 204 No Content

### Add Owner to Pet
- **URL**: `/pets/{petId}/owners`
- **Method**: `POST`
- **Authentication**: Required (Primary pet owner or Admin)
- **Request Body**:
  ```json
  {
    "userProfileId": 2,
    "isPrimaryOwner": false
  }
  ```
- **Response**: Owner details with 201 Created status

### Remove Owner from Pet
- **URL**: `/pets/{petId}/owners/{ownerId}`
- **Method**: `DELETE`
- **Authentication**: Required (Primary pet owner or Admin)
- **Response**: 204 No Content

## Health Record Endpoints

### Get Pet's Health Records
- **URL**: `/pets/{petId}/healthrecords`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Array of health records

### Get Health Record by ID
- **URL**: `/healthrecords/{id}`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Health record details

### Create Health Record
- **URL**: `/pets/{petId}/healthrecords`
- **Method**: `POST`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "visitDate": "2023-05-15T10:30:00Z",
    "veterinarianId": 1,
    "diagnosis": "Annual checkup",
    "treatment": "Vaccinations updated",
    "notes": "Overall health is good"
  }
  ```
- **Response**: Created health record with 201 Created status

### Update Health Record
- **URL**: `/healthrecords/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "visitDate": "2023-05-15T10:30:00Z",
    "veterinarianId": 1,
    "diagnosis": "Annual checkup and dental cleaning",
    "treatment": "Vaccinations updated, teeth cleaned",
    "notes": "Overall health is good"
  }
  ```
- **Response**: Updated health record

### Delete Health Record
- **URL**: `/healthrecords/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: 204 No Content

## Vaccination Endpoints

### Get Pet's Vaccinations
- **URL**: `/pets/{petId}/vaccinations`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Array of vaccination records

### Get Vaccination by ID
- **URL**: `/vaccinations/{id}`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Vaccination details

### Create Vaccination
- **URL**: `/vaccinations`
- **Method**: `POST`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "petId": 1,
    "description": "Rabies Vaccine",
    "recordDate": "2023-05-15T10:30:00Z",
    "dueDate": "2024-05-15T10:30:00Z",
    "veterinarianId": 1,
    "notes": "3-year vaccine administered",
    "attachments": "vaccine_certificate.pdf"
  }
  ```
- **Response**: Created vaccination record with 201 Created status

### Update Vaccination
- **URL**: `/vaccinations/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "description": "Rabies Vaccine",
    "recordDate": "2023-05-15T10:30:00Z",
    "dueDate": "2024-05-15T10:30:00Z",
    "veterinarianId": 1,
    "notes": "3-year vaccine administered, certificate provided",
    "attachments": "vaccine_certificate_updated.pdf"
  }
  ```
- **Response**: Updated vaccination record

### Delete Vaccination
- **URL**: `/vaccinations/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: 204 No Content

### Get Upcoming Vaccinations for Pet
- **URL**: `/pets/{petId}/vaccinations/upcoming`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Query Parameters**: `daysAhead` (optional, default: 30)
- **Response**: Array of upcoming vaccination records

### Get All Upcoming Vaccinations for User
- **URL**: `/vaccinations/upcoming`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**: `daysAhead` (optional, default: 30)
- **Response**: Array of upcoming vaccination records for all user's pets

## Medication Endpoints

### Get Pet's Medications
- **URL**: `/pets/{petId}/medications`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Array of medication records

### Get Medication by ID
- **URL**: `/medications/{id}`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Medication details

### Create Medication
- **URL**: `/medications`
- **Method**: `POST`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "petId": 1,
    "name": "Amoxicillin",
    "dosage": "50mg",
    "frequency": "Twice daily",
    "startDate": "2023-06-01T00:00:00Z",
    "endDate": "2023-06-14T00:00:00Z",
    "instructions": "Give with food",
    "prescriber": "Dr. Smith",
    "reminderEnabled": true,
    "reminderFrequency": "Daily",
    "reminderTime": "08:00:00"
  }
  ```
- **Response**: Created medication record with 201 Created status

### Update Medication
- **URL**: `/medications/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "name": "Amoxicillin",
    "dosage": "75mg",
    "frequency": "Twice daily",
    "startDate": "2023-06-01T00:00:00Z",
    "endDate": "2023-06-14T00:00:00Z",
    "instructions": "Give with food",
    "prescriber": "Dr. Smith",
    "isActive": true,
    "reminderEnabled": true,
    "reminderFrequency": "Daily",
    "reminderTime": "08:00:00"
  }
  ```
- **Response**: Updated medication record

### Delete Medication
- **URL**: `/medications/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: 204 No Content

### Update Medication Reminder Settings
- **URL**: `/medications/{id}/reminder`
- **Method**: `PUT`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "reminderEnabled": true,
    "reminderFrequency": "Daily",
    "reminderTime": "08:00:00"
  }
  ```
- **Response**: Updated medication record

### Get User's Medication Reminders
- **URL**: `/user/medication-reminders`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Array of medication reminders for all user's pets

### Mark Medication Reminder as Sent
- **URL**: `/medications/{id}/reminder-sent`
- **Method**: `POST`
- **Authentication**: Required (Admin only)
- **Response**: 200 OK

## Weight Endpoints

### Get Pet's Weight Records
- **URL**: `/pets/{petId}/weights`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Array of weight records

### Get Weight Record by ID
- **URL**: `/weights/{id}`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Weight record details

### Create Weight Record
- **URL**: `/weights`
- **Method**: `POST`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "petId": 1,
    "weightValue": 5.2,
    "weightUnit": "kg",
    "date": "2023-06-01T00:00:00Z",
    "notes": "Weighed at home"
  }
  ```
- **Response**: Created weight record with 201 Created status

### Update Weight Record
- **URL**: `/weights/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "weightValue": 5.3,
    "weightUnit": "kg",
    "date": "2023-06-01T00:00:00Z",
    "notes": "Weighed at home with digital scale"
  }
  ```
- **Response**: Updated weight record

### Delete Weight Record
- **URL**: `/weights/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: 204 No Content

### Get Pet's Weight History
- **URL**: `/pets/{petId}/weight-history`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Array of weight history records formatted for graphing

## Feeding Schedule Endpoints

### Get Pet's Feeding Schedules
- **URL**: `/pets/{petId}/feeding-schedules`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Array of feeding schedules

### Get Feeding Schedule by ID
- **URL**: `/feeding-schedules/{id}`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Feeding schedule details

### Create Feeding Schedule
- **URL**: `/feeding-schedules`
- **Method**: `POST`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "petId": 1,
    "feedingTime": "08:00:00",
    "foodType": "Dry kibble",
    "portion": "1/2 cup",
    "notes": "Mix with warm water"
  }
  ```
- **Response**: Created feeding schedule with 201 Created status

### Update Feeding Schedule
- **URL**: `/feeding-schedules/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "feedingTime": "08:30:00",
    "foodType": "Dry kibble",
    "portion": "1/2 cup",
    "notes": "Mix with warm water",
    "isActive": true
  }
  ```
- **Response**: Updated feeding schedule

### Delete Feeding Schedule
- **URL**: `/feeding-schedules/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: 204 No Content

## Appointment Endpoints

### Get Pet's Appointments
- **URL**: `/pets/{petId}/appointments`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Array of appointments

### Get Appointment by ID
- **URL**: `/appointments/{id}`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Appointment details

### Create Appointment
- **URL**: `/pets/{petId}/appointments`
- **Method**: `POST`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "appointmentDate": "2023-06-15T14:00:00Z",
    "veterinarianId": 1,
    "reason": "Annual checkup",
    "notes": "Please bring vaccination records"
  }
  ```
- **Response**: Created appointment with 201 Created status

### Update Appointment
- **URL**: `/appointments/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "appointmentDate": "2023-06-16T15:00:00Z",
    "veterinarianId": 1,
    "reason": "Annual checkup",
    "notes": "Rescheduled from previous day"
  }
  ```
- **Response**: Updated appointment

### Delete Appointment
- **URL**: `/appointments/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: 204 No Content

## Care Provider Endpoints

### Get User's Care Providers
- **URL**: `/care-providers`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Array of care providers

### Get Care Provider by ID
- **URL**: `/care-providers/{id}`
- **Method**: `GET`
- **Authentication**: Required (Owner or Admin)
- **Response**: Care provider details

### Create Care Provider
- **URL**: `/care-providers`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "Animal Hospital",
    "type": "Veterinary Clinic",
    "address": "123 Main St, Anytown, USA",
    "phone": "555-123-4567",
    "email": "info@animalhospital.com",
    "website": "https://www.animalhospital.com",
    "notes": "Open 24/7 for emergencies"
  }
  ```
- **Response**: Created care provider with 201 Created status

### Update Care Provider
- **URL**: `/care-providers/{id}`
- **Method**: `PUT`
- **Authentication**: Required (Owner or Admin)
- **Request Body**:
  ```json
  {
    "name": "Animal Hospital & Emergency Care",
    "type": "Veterinary Clinic",
    "address": "123 Main St, Anytown, USA",
    "phone": "555-123-4567",
    "email": "info@animalhospital.com",
    "website": "https://www.animalhospital.com",
    "notes": "Open 24/7 for emergencies, now offering dental services"
  }
  ```
- **Response**: Updated care provider

### Delete Care Provider
- **URL**: `/care-providers/{id}`
- **Method**: `DELETE`
- **Authentication**: Required (Owner or Admin)
- **Response**: 204 No Content

## Settings Endpoints

### Get Notification Settings
- **URL**: `/settings/notifications`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: User's notification settings

### Update Notification Settings
- **URL**: `/settings/notifications`
- **Method**: `PUT`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "emailNotificationsEnabled": true,
    "pushNotificationsEnabled": true,
    "appointmentReminders": true,
    "medicationReminders": true,
    "vaccinationReminders": true,
    "weightReminders": false,
    "feedingReminders": false,
    "reminderLeadTime": 24
  }
  ```
- **Response**: Updated notification settings

### Get Theme Preference
- **URL**: `/settings/theme`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: User's theme preference

### Update Theme Preference
- **URL**: `/settings/theme`
- **Method**: `PUT`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "themePreference": "dark"
  }
  ```
- **Response**: Updated theme preference

## Dashboard Endpoints

### Get User Dashboard
- **URL**: `/dashboard`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: User dashboard data including pet summaries and upcoming events

### Get Pet Dashboard
- **URL**: `/pets/{petId}/dashboard`
- **Method**: `GET`
- **Authentication**: Required (Pet owner or Admin)
- **Response**: Pet dashboard data including health records, medications, appointments, and weight records

### Get Calendar Events
- **URL**: `/calendar`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `startDate` (optional): Start date for calendar events
  - `endDate` (optional): End date for calendar events
- **Response**: Array of calendar events for all user's pets

## Export Endpoints

### Export Pet Records
- **URL**: `/pets/{petId}/export`
- **Method**: `POST`
- **Authentication**: Required (Pet owner or Admin)
- **Request Body**:
  ```json
  {
    "format": "PDF",
    "sections": ["BasicInfo", "HealthRecords", "Medications", "Appointments", "WeightRecords"],
    "startDate": "2023-01-01T00:00:00Z",
    "endDate": "2023-12-31T23:59:59Z"
  }
  ```
- **Response**: Export result with file URL

## Testing the API

You can test the API using tools like:

1. **Yaak**: A popular API client for sending requests and viewing responses
2. **curl**: A command-line tool for making HTTP requests
3. **The included .http file**: Open `PetPal.API.http` in Visual Studio Code with the REST Client extension installed

### Example curl Commands

#### Register a User
```bash
curl -X POST https://localhost:7000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!","firstName":"John","lastName":"Doe"}'
```

#### Login
```bash
curl -X POST https://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}' \
  -c cookies.txt
```

#### Get Current User's Pets
```bash
curl -X GET https://localhost:7000/user/pets \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

#### Create a Pet
```bash
curl -X POST https://localhost:7000/pets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Fluffy","species":"Cat","breed":"Persian","dateOfBirth":"2020-01-15T00:00:00Z","weight":4.5,"color":"White","microchipNumber":"123456789012345"}'
```

## Status Codes

The API uses standard HTTP status codes:

- `200 OK`: The request was successful
- `201 Created`: A new resource was successfully created
- `204 No Content`: The request was successful but there is no content to return
- `400 Bad Request`: The request was malformed or invalid
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user does not have permission
- `404 Not Found`: The requested resource was not found
- `409 Conflict`: The request conflicts with the current state of the server
- `500 Internal Server Error`: An error occurred on the server

## Authentication Notes

- The API uses cookie-based authentication
- Cookies are automatically included in requests when using a browser or tools that support cookies
- For tools that don't automatically handle cookies, you need to manually include the cookie in subsequent requests
- The cookie is named `PetPalAuth` and is set to expire after 8 hours