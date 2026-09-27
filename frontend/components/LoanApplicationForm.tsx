import type { FormEventHandler, InputHTMLAttributes } from 'react';

type Props = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  error: string;
};

export default function LoanApplicationForm({
  onSubmit,
  isSubmitting,
  error,
}: Props) {
  const input = (
    name: string,
    label: string,
    type: InputHTMLAttributes<HTMLInputElement>['type'] = 'text',
    extra: InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label key={name}>
      {label}
      <input name={name} type={type} required {...extra} />
    </label>
  );
  return (
    <form onSubmit={onSubmit}>
      <section className="form-section">
        <div className="section-heading">
          <span className="section-number">01</span>
          <h2>Customer details</h2>
        </div>
        <div className="form-grid">
          {input('full_name', 'Full name', 'text', {
            minLength: 2,
            maxLength: 120,
            autoComplete: 'name',
            placeholder: 'As on your identity document',
          })}
          {input('mobile', 'Mobile number', 'tel', {
            pattern: '[0-9]{10}',
            maxLength: 10,
            inputMode: 'numeric',
            autoComplete: 'tel-national',
            title: 'Enter exactly 10 digits',
          })}
          {input('email', 'Email address', 'email', {
            maxLength: 254,
            autoComplete: 'email',
          })}
          {input('date_of_birth', 'Date of birth', 'date', {
            min: '1900-01-01',
            max: new Date(Date.now() - 86400000).toLocaleDateString('en-CA'),
          })}
          {input('city', 'City', 'text', {
            minLength: 2,
            maxLength: 100,
            autoComplete: 'address-level2',
          })}
          {input('pincode', 'Pincode', 'text', {
            pattern: '[1-9][0-9]{5}',
            maxLength: 6,
            inputMode: 'numeric',
            autoComplete: 'postal-code',
            title: 'Enter a valid 6-digit pincode',
          })}
        </div>
      </section>
      <section className="form-section">
        <div className="section-heading">
          <span className="section-number">02</span>
          <h2>Loan details</h2>
        </div>
        <div className="form-grid">
          <label>
            Loan type
            <select name="loan_type" required defaultValue="">
              <option value="" disabled>
                Select loan type
              </option>
              <option>Home Loan</option>
              <option value="LAP">Loan Against Property (LAP)</option>
            </select>
          </label>
          <label>
            Employment type
            <select name="employment_type" required defaultValue="">
              <option value="" disabled>
                Select employment type
              </option>
              <option>Salaried</option>
              <option>Self Employed</option>
            </select>
          </label>
          {input('monthly_income', 'Monthly income (₹)', 'number', {
            min: '.01',
            max: '99999999999999.99',
            step: '.01',
          })}
          {input('loan_amount', 'Loan amount required (₹)', 'number', {
            min: '.01',
            max: '99999999999999.99',
            step: '.01',
          })}
          {input('property_value', 'Property value (₹)', 'number', {
            min: '.01',
            max: '99999999999999.99',
            step: '.01',
          })}
        </div>
      </section>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          I consent that customer information will be shared with lending
          partners for loan processing.
        </span>
      </label>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="submit-row">
        <small>
          All fields are required. Your information is used for this loan
          assessment.
        </small>
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Assessing application…' : 'Check eligibility →'}
        </button>
      </div>
    </form>
  );
}
