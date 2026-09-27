import { apiResponse } from '@/lib/api';
import type { ApplicationResult, LeadCreated } from '@/lib/types';

function validateCustomerDetails(data: Record<string, FormDataEntryValue>) {
  const dateOfBirth = new Date(`${data.date_of_birth}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateOfBirth >= today || dateOfBirth < new Date('1900-01-01T00:00:00')) {
    throw new Error('Enter a valid date of birth before today.');
  }

  if (
    String(data.full_name).trim().length < 2 ||
    String(data.city).trim().length < 2
  ) {
    throw new Error('Name and city must contain at least two characters.');
  }
}

export async function submitApplication(
  form: FormData,
): Promise<ApplicationResult> {
  const data = Object.fromEntries(form.entries());
  validateCustomerDetails(data);

  const response = await apiResponse(
    '/api/leads',
    {
      method: 'POST',
      body: JSON.stringify({ ...data, consent: form.get('consent') === 'on' }),
    },
    false,
  );
  const lead: LeadCreated = await response.json();

  // The API keeps its four-field JSON contract; reasons arrive in exposed headers.
  return {
    ...lead,
    reasons: JSON.parse(response.headers.get('X-Rejection-Reasons') || '[]'),
    warning: response.headers.get('X-Credit-Score-Error'),
  };
}
