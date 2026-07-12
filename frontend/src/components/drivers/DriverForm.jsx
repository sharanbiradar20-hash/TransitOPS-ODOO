import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import Button from '../common/Button';

const DriverForm = ({ onSubmit, editingDriver, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: '',
    licenseExpiry: '',
    contactNumber: '',
    status: 'AVAILABLE'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingDriver) {
      // Format licenseExpiry date from database format (YYYY-MM-DD or ISO string) to YYYY-MM-DD for standard html date picker input
      let formattedDate = '';
      if (editingDriver.licenseExpiry) {
        formattedDate = editingDriver.licenseExpiry.substring(0, 10);
      }

      setFormData({
        name: editingDriver.name || '',
        licenseNumber: editingDriver.licenseNumber || '',
        licenseCategory: editingDriver.licenseCategory || '',
        licenseExpiry: formattedDate,
        contactNumber: editingDriver.contactNumber || '',
        status: editingDriver.status || 'AVAILABLE'
      });
    } else {
      setFormData({
        name: '',
        licenseNumber: '',
        licenseCategory: '',
        licenseExpiry: '',
        contactNumber: '',
        status: 'AVAILABLE'
      });
    }
    setErrors({});
  }, [editingDriver]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name || String(formData.name).trim() === '') {
      tempErrors.name = 'Driver name is required';
    }
    if (!formData.licenseNumber || String(formData.licenseNumber).trim() === '') {
      tempErrors.licenseNumber = 'License number is required';
    }
    if (!formData.licenseCategory || String(formData.licenseCategory).trim() === '') {
      tempErrors.licenseCategory = 'License category is required';
    }
    
    // License Expiry Date: must be a future date (not in the past)
    if (!formData.licenseExpiry) {
      tempErrors.licenseExpiry = 'License expiration date is required';
    } else {
      const [year, month, day] = formData.licenseExpiry.split('-').map(Number);
      const expiryLocal = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiryLocal.setHours(0, 0, 0, 0);
      
      if (expiryLocal <= today) {
        tempErrors.licenseExpiry = 'License expiry date must be a future date';
      }
    }
    
    // Contact Number: required, must be at least 10 digits
    if (!formData.contactNumber) {
      tempErrors.contactNumber = 'Contact number is required';
    } else {
      const digits = formData.contactNumber.replace(/\D/g, '');
      if (digits.length < 10) {
        tempErrors.contactNumber = 'Contact number must be at least 10 digits';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const driverStatuses = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ON_TRIP', label: 'On Trip' },
    { value: 'OFF_DUTY', label: 'Off Duty' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  return (
    <div className="card">
      <div className="card-title">
        {editingDriver ? 'Edit Driver Details' : 'Register New Driver'}
      </div>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          error={errors.name}
          required
        />

        <InputField
          label="Contact Number"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          placeholder="e.g. +1 555-0199"
          error={errors.contactNumber}
          required
        />

        <div className="form-row">
          <InputField
            label="License Number"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="e.g. DL-998877665"
            error={errors.licenseNumber}
            required
          />

          <InputField
            label="License Category"
            name="licenseCategory"
            value={formData.licenseCategory}
            onChange={handleChange}
            placeholder="e.g. Class A CDL / Class 5"
            error={errors.licenseCategory}
            required
          />
        </div>

        <div className="form-row">
          <InputField
            label="License Expiry Date"
            type="date"
            name="licenseExpiry"
            value={formData.licenseExpiry}
            onChange={handleChange}
            error={errors.licenseExpiry}
            required
          />

          {editingDriver && (
            <InputField
              label="Status"
              type="select"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={driverStatuses}
              required
            />
          )}
        </div>

        <div className="form-actions">
          {editingDriver && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary">
            {editingDriver ? 'Update Driver' : 'Register Driver'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DriverForm;
