import React from 'react';

export default function EditPopup({ heading, countries, states, districtValue, onSubmit, onCancel }:any) {
  const handleSubmit = () => {
    onSubmit();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div>
      <div>
        <h1>{heading}</h1>
      </div>
      <hr />
      <div>
        <label htmlFor="country-select">Select a country:</label>
        <select id="country-select">
          {/* {countries.map((country:any) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))} */}
        </select>
      </div>
      <div>
        <label>State Name:</label>
        <select id="state-name">
          {/* {states.map((state:any) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))} */}
        </select>
      </div>
      <div>
        <label>District Name</label>
        <input type="text" value={districtValue} />
      </div>
      <div className="justify-between mt-4 px-2 space-x-3">
        <button className="bg-green-500 rounded text-white px-2 py-2 text-sm" onClick={handleSubmit}>
          Submit
        </button>
        <button className="bg-gray-300 rounded text-black px-2 py-2 text-sm" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
