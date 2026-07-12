import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import Button from '../common/Button';

const VehicleForm = ({ onSubmit, editingVehicle, onCancel }) => {
  const [formData, setFormData] = useState({
    regNumber: '',
    nameModel: '',
    type: 'TRUCK',
    maxLoadCapacity: '',
    odometer: '',
    acquisitionCost: '',
    status: 'AVAILABLE'
  });

  const [regionType, setRegionType] = useState('North');
  const [customRegion, setCustomRegion] = useState('');
  const [errors, setErrors] = useState({});

  const fixedRegions = ['North', 'South', 'East', 'West', 'Central', 'Northeast'];

  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        regNumber: editingVehicle.regNumber || '',
        nameModel: editingVehicle.nameModel || '',
        type: editingVehicle.type || 'TRUCK',
        maxLoadCapacity: editingVehicle.maxLoadCapacity || '',
        odometer: editingVehicle.odometer || '',
        acquisitionCost: editingVehicle.acquisitionCost || '',
        status: editingVehicle.status || 'AVAILABLE'
      });
      const r = editingVehicle.region || '';
      if (fixedRegions.includes(r)) {
        setRegionType(r);
        setCustomRegion('');
      } else {
        setRegionType(r ? 'Custom' : 'North');
        setCustomRegion(r);
      }
    } else {
      setFormData({
        regNumber: '',
        nameModel: '',
        type: 'TRUCK',
        maxLoadCapacity: '',
        odometer: '',
        acquisitionCost: '',
        status: 'AVAILABLE'
      });
      setRegionType('North');
      setCustomRegion('');
    }
    setErrors({});
  }, [editingVehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Cast numeric fields automatically
    const numericFields = ['maxLoadCapacity', 'odometer', 'acquisitionCost'];
    const updatedValue = numericFields.includes(name) && value !== '' ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegionTypeChange = (e) => {
    const val = e.target.value;
    setRegionType(val);
    if (errors.region) {
      setErrors((prev) => ({ ...prev, region: '' }));
    }
  };

  const handleCustomRegionChange = (e) => {
    const val = e.target.value;
    setCustomRegion(val);
    if (errors.region) {
      setErrors((prev) => ({ ...prev, region: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.regNumber || String(formData.regNumber).trim() === '') {
      tempErrors.regNumber = 'Registration Number is required';
    }
    if (!formData.nameModel || String(formData.nameModel).trim() === '') {
      tempErrors.nameModel = 'Name/Model is required';
    }
    
    const activeRegion = regionType === 'Custom' ? customRegion : regionType;
    if (!activeRegion || String(activeRegion).trim() === '') {
      tempErrors.region = 'Region is required';
    }
    
    // Max Load Capacity must be a positive number (> 0)
    const load = Number(formData.maxLoadCapacity);
    if (formData.maxLoadCapacity === '' || isNaN(load) || load <= 0) {
      tempErrors.maxLoadCapacity = 'Max Load Capacity must be a positive number';
    }

    // Odometer must be zero or positive (>= 0)
    const odo = Number(formData.odometer);
    if (formData.odometer === '' || isNaN(odo) || odo < 0) {
      tempErrors.odometer = 'Odometer must be zero or a positive number';
    }

    // Acquisition Cost must be a positive number (> 0)
    const cost = Number(formData.acquisitionCost);
    if (formData.acquisitionCost === '' || isNaN(cost) || cost <= 0) {
      tempErrors.acquisitionCost = 'Acquisition Cost must be a positive number';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const activeRegion = regionType === 'Custom' ? customRegion : regionType;
      onSubmit({
        ...formData,
        region: activeRegion
      });
    }
  };

  const vehicleTypes = [
    { value: 'TRUCK', label: 'Truck' },
    { value: 'VAN', label: 'Van' },
    { value: 'CAR', label: 'Car' },
    { value: 'TRAILER', label: 'Trailer' }
  ];

  const regionOptions = [
    { value: 'North', label: 'North' },
    { value: 'South', label: 'South' },
    { value: 'East', label: 'East' },
    { value: 'West', label: 'West' },
    { value: 'Central', label: 'Central' },
    { value: 'Northeast', label: 'Northeast' },
    { value: 'Custom', label: 'Custom' }
  ];

  const vehicleStatuses = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ON_TRIP', label: 'On Trip' },
    { value: 'IN_SHOP', label: 'In Shop' },
    { value: 'RETIRED', label: 'Retired' }
  ];

  return (
    <div className="card">
      <div className="card-title">
        {editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}
      </div>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Registration Number"
          name="regNumber"
          value={formData.regNumber}
          onChange={handleChange}
          placeholder="e.g. MH-12-AB-3456"
          error={errors.regNumber}
          required
        />

        <InputField
          label="Name / Model"
          name="nameModel"
          value={formData.nameModel}
          onChange={handleChange}
          placeholder="e.g. Tata Prima / Volvo FH"
          error={errors.nameModel}
          required
        />

        <div className="form-row">
          <InputField
            label="Vehicle Type"
            type="select"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={vehicleTypes}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <InputField
              label="Region"
              type="select"
              name="regionType"
              value={regionType}
              onChange={handleRegionTypeChange}
              options={regionOptions}
              error={regionType !== 'Custom' ? errors.region : null}
              required
            />
            {regionType === 'Custom' && (
              <InputField
                label="Custom Region Name"
                name="customRegion"
                value={customRegion}
                onChange={handleCustomRegionChange}
                placeholder="Enter custom region name"
                error={errors.region}
                required
              />
            )}
          </div>
        </div>

        <div className="form-row">
          <InputField
            label="Max Load Capacity (kg)"
            type="number"
            name="maxLoadCapacity"
            value={formData.maxLoadCapacity}
            onChange={handleChange}
            placeholder="e.g. 15000"
            error={errors.maxLoadCapacity}
            required
            min="0"
          />

          <InputField
            label="Odometer (km)"
            type="number"
            name="odometer"
            value={formData.odometer}
            onChange={handleChange}
            placeholder="e.g. 45000"
            error={errors.odometer}
            required
            min="0"
          />
        </div>

        <div className="form-row">
          <InputField
            label="Acquisition Cost ($)"
            type="number"
            name="acquisitionCost"
            value={formData.acquisitionCost}
            onChange={handleChange}
            placeholder="e.g. 75000"
            error={errors.acquisitionCost}
            required
            min="0"
          />

          {editingVehicle && (
            <InputField
              label="Status"
              type="select"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={vehicleStatuses}
              required
            />
          )}
        </div>

        <div className="form-actions">
          {editingVehicle && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary">
            {editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
