# Backend API Integration Documentation

This document outlines the form inputs and data structures available in the Jevah frontend UI that need to be integrated with the backend API.

## Overview

The Jevah frontend has two main forms that require backend integration:
1. **Newsletter Subscription Form** (Footer)
2. **Contact Form** (Contact Us section and Contact page)

---

## 1. Newsletter Subscription Form

### Location
- Footer component (appears on all pages)

### Form Fields

| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| `email` | string | Yes | Valid email format | User's email address for newsletter subscription |

### Expected API Endpoint

```
POST /api/newsletter/subscribe
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Expected Response

**Success (201 Created):**
```json
{
  "message": "Successfully subscribed to newsletter",
  "subscriber": {
    "id": "1234567890",
    "email": "user@example.com",
    "subscribedAt": "2024-12-15T10:30:00.000Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Valid email is required"
}
```

**Error (409 Conflict):**
```json
{
  "message": "Email already subscribed"
}
```

### Frontend Implementation Notes
- Form is located in `src/sections/Footer.tsx`
- Currently logs to console on submit
- Needs to be connected to backend API endpoint
- Should show success/error messages to user

---

## 2. Contact Form

### Locations
- Contact Us section (Homepage)
- Contact page (`/contact`)

### Form Fields

| Field Name | Type | Required | Max Length | Description |
|------------|------|----------|------------|-------------|
| `fullName` | string | Yes | 100 characters | User's full name |
| `email` | string | Yes | - | Valid email address |
| `phoneNumber` | string | Yes | - | User's phone number (should accept international formats) |
| `message` | string | Yes | 500 characters | User's message/query |
| `useCase` | string | Yes | 200 characters | Description of how user intends to use Jevah |

### Expected API Endpoint

```
POST /api/contact/submit
```

### Request Body

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "message": "I would like to know more about Jevah features for my church community.",
  "useCase": "I want to use Jevah to connect our church members and share prayer requests."
}
```

### Expected Response

**Success (201 Created):**
```json
{
  "message": "Contact form submitted successfully",
  "contact": {
    "id": "1234567890",
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "message": "All fields are required"
}
```

or

```json
{
  "message": "Valid email is required"
}
```

### Frontend Implementation Notes
- Forms are located in:
  - `src/sections/ContactUs.tsx` (Homepage section)
  - `src/pages/Contact.tsx` (Contact page)
- Currently logs to console on submit
- Needs to be connected to backend API endpoint
- Should show success/error messages to user
- Message field has character counter (500 max characters)

---

## Additional Contact Form (Contact Page)

The Contact page (`/contact`) has a simplified contact form with different fields:

### Form Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `name` | string | Yes | User's name |
| `email` | string | Yes | Valid email address |
| `message` | string | Yes | User's message |

### Expected API Endpoint

```
POST /api/contact/submit
```

### Request Body

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "message": "I have a question about Jevah features."
}
```

**Note:** This form has fewer fields than the main Contact Us form. The backend should handle both formats or you may want to create a separate endpoint.

---

## Validation Requirements

### Email Validation
- Must be a valid email format
- Should check for common email patterns
- Consider server-side validation even if client-side exists

### Phone Number Validation
- Should accept international formats
- Accept formats like: `+1234567890`, `(123) 456-7890`, `123-456-7890`, etc.
- Consider normalizing phone numbers before storage

### Text Field Validation
- `fullName`: 2-100 characters
- `message`: 10-500 characters
- `useCase`: 5-200 characters

---

## Error Handling

The frontend expects the following error response format:

```json
{
  "message": "Error description here"
}
```

All errors should return appropriate HTTP status codes:
- `400` - Bad Request (validation errors)
- `409` - Conflict (duplicate email, etc.)
- `500` - Internal Server Error

---

## CORS Configuration

The frontend will be making requests from:
- Development: `http://localhost:5173`
- Production: (To be determined)

Ensure CORS is properly configured to allow requests from these origins.

---

## Environment Variables

The frontend uses the following environment variable for API URL:

```
VITE_API_URL=http://localhost:3001/api
```

Update this in production to point to your actual backend URL.

---

## Testing Checklist

- [ ] Newsletter subscription endpoint accepts email and returns success
- [ ] Newsletter subscription endpoint handles duplicate emails
- [ ] Newsletter subscription endpoint validates email format
- [ ] Contact form endpoint accepts all required fields
- [ ] Contact form endpoint validates all field formats
- [ ] Contact form endpoint handles missing fields gracefully
- [ ] Both endpoints return appropriate error messages
- [ ] CORS is configured correctly
- [ ] Data is being stored in database
- [ ] Email notifications are sent (if applicable)

---

## Next Steps

1. Review and implement the API endpoints as specified
2. Set up database tables/collections for storing:
   - Newsletter subscribers
   - Contact form submissions
3. Implement email notifications (optional but recommended)
4. Add rate limiting to prevent abuse
5. Set up proper error logging
6. Test integration with frontend
7. Update frontend API URL in production environment

---

## Contact Information

For reference, the Jevah contact information used throughout the frontend:

- **Email**: support@jevahapp.com
- **Phone**: +234 703 774 2764
- **WhatsApp**: +234 703 774 2764 (same as phone)
- **Address**: 24a Bashorun Okunsanya Street, Off Admiralty Way, Lekki Phase 1, Lagos.

---

## Questions or Issues?

If you have any questions about the form structures or need clarification on any field, please contact the frontend development team.

