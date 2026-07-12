import React from 'react';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  options = [], // [{ value, label }] - used if type is 'select'
  disabled = false,
  className = '',
  min,
  max,
  ...props
}) => {
  const isSelect = type === 'select';

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {isSelect ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="form-input"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          className="form-input"
          {...props}
        />
      )}

      {error && (
        <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: '500' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default InputField;
