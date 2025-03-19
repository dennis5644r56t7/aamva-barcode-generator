'use client';

import { useState, useEffect } from 'react';
import { AAMVAData, formatAAMVAString, validateAAMVAData } from './aamvaBarcode';
import { COUNTRIES } from './countryData';

const HAIR_COLORS = [
  { code: 'BAL', name: 'Bald' },
  { code: 'BLK', name: 'Black' },
  { code: 'BLN', name: 'Blonde' },
  { code: 'BRO', name: 'Brown' },
  { code: 'GRY', name: 'Gray' },
  { code: 'RED', name: 'Red' },
  { code: 'SDY', name: 'Sandy' },
  { code: 'WHI', name: 'White' }
];

const EYE_COLORS = [
  { code: 'BLK', name: 'Black' },
  { code: 'BLU', name: 'Blue' },
  { code: 'BRO', name: 'Brown' },
  { code: 'GRY', name: 'Gray' },
  { code: 'GRN', name: 'Green' },
  { code: 'HAZ', name: 'Hazel' },
  { code: 'MAR', name: 'Maroon' },
  { code: 'PNK', name: 'Pink' },
  { code: 'DIC', name: 'Dichromatic' }
];

const VEHICLE_CLASSES = [
  { code: 'A', name: 'Class A - Commercial trucks' },
  { code: 'B', name: 'Class B - Heavy straight vehicles' },
  { code: 'C', name: 'Class C - Light commercial' },
  { code: 'D', name: 'Class D - Regular operator' },
  { code: 'E', name: 'Class E - Taxi/Transport' },
  { code: 'F', name: 'Class F - Special vehicle' },
  { code: 'G', name: 'Class G - Agricultural' },
  { code: 'H', name: 'Class H - Special purpose' },
  { code: 'M', name: 'Class M - Motorcycle' }
];

const RACES = [
  { code: 'AI', name: 'American Indian' },
  { code: 'AP', name: 'Asian/Pacific Islander' },
  { code: 'BK', name: 'Black' },
  { code: 'H', name: 'Hispanic' },
  { code: 'W', name: 'White' },
  { code: 'O', name: 'Other' }
];

const RESTRICTIONS = [
  { code: 'A', name: 'Corrective Lenses Required' },
  { code: 'B', name: 'Mechanical Assistive Device' },
  { code: 'C', name: 'Restricted to Employment' },
  { code: 'D', name: 'Medical Waiver' },
  { code: 'E', name: 'Limited to Daylight Only' },
  { code: 'F', name: 'Limited to Specific Vehicle' },
  { code: 'G', name: 'Limited to Specific Conditions' },
  { code: 'H', name: 'Hearing Aid Required' },
];

const ENDORSEMENTS = [
  { code: 'H', name: 'Hazardous Materials' },
  { code: 'N', name: 'Tank Vehicle' },
  { code: 'P', name: 'Passenger Transport' },
  { code: 'S', name: 'School Bus' },
  { code: 'T', name: 'Combination Vehicle' },
  { code: 'X', name: 'Combination Hazardous Materials' },
];

export default function Home() {
  const [formData, setFormData] = useState<AAMVAData>({
    country: 'USA',
    jurisdictionId: '636014',
    aamvaVersion: '08',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    expiryDate: '',
    issueDate: '',
    licenseNumber: '',
    address: '',
    city: '',
    state: 'CA',
    postalCode: '',
    documentDiscriminator: '',
    inventoryControl: '',
    auditInformation: '',
    countryId: 'USA',
    height: '',
    weight: '',
    eyeColor: 'BRO',
    hairColor: 'BRO',
    race: 'O',
    restrictions: '',
    endorsements: '',
    vehicleClass: 'D',
    sex: '1',
    isOrganDonor: false,
    isVeteran: false,
    under18Until: '',
    under19Until: '',
    under21Until: '',
    DD: '',
    DDF: '',
    DDG: '',
    DDK: '',
    DDL: ''
  });

  const [heightUnit, setHeightUnit] = useState('inches');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [barcodeImage, setBarcodeImage] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const updateFormData = <K extends keyof AAMVAData>(field: K, value: AAMVAData[K]) => {
    console.log(`Updating ${field} to:`, value); // Debug form updates
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Update jurisdiction ID when country/state changes
  useEffect(() => {
    const country = COUNTRIES[formData.country];
    if (country) {
      const state = country.states.find(s => s.code === formData.state);
      if (state) {
        updateFormData('jurisdictionId', state.issuerId);
      }
    }
  }, [formData.country, formData.state]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = COUNTRIES[e.target.value];
    if (country) {
      updateFormData('country', e.target.value);
      updateFormData('state', country.states[0].code);
      updateFormData('countryId', e.target.value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name in formData) {
      updateFormData(name as keyof AAMVAData, value as AAMVAData[keyof AAMVAData]);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name in formData) {
      updateFormData(name as keyof AAMVAData, checked as AAMVAData[keyof AAMVAData]);
    }
  };

  // Convert height from feet/inches to inches
  const convertHeight = () => {
    if (heightUnit === 'feet') {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      return (feet * 12 + inches).toString();
    }
    return formData.height;
  };

  const generateBarcode = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const heightInInches = heightUnit === 'feet'
        ? (parseInt(heightFeet) * 12 + parseInt(heightInches || '0')).toString()
        : formData.height;

      const updatedFormData = {
        ...formData,
        height: heightInInches,
        DD: formData.DD || '0',
        DDF: formData.DDF || '0',
        DDG: formData.DDG || '0',
        DDK: formData.DDK || '0',
        DDL: formData.DDL || '0'
      };

      // Debug name fields specifically
      console.log('Name Fields:', {
        firstName: updatedFormData.firstName,
        middleName: updatedFormData.middleName,
        lastName: updatedFormData.lastName
      });

      const { isValid, errors } = validateAAMVAData(updatedFormData);
      if (!isValid) {
        setErrors(errors);
        setLoading(false);
        return;
      }

      const aamvaString = formatAAMVAString(updatedFormData);
      console.log('AAMVA String:', aamvaString);
      console.log('AAMVA String Length:', aamvaString.length);
      console.log('AAMVA String Hex:', Array.from(aamvaString).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
      
      // Create a hidden canvas
      const canvas = document.createElement('canvas');
      canvas.id = 'barcodeCanvas';
      canvas.style.display = 'none';
      document.body.appendChild(canvas);

      try {
        // Import bwip-js browser version and get the function
        const { toCanvas } = await import('@bwip-js/browser');
        
        // Set initial canvas size for PVC card dimensions
        canvas.width = 640;
        canvas.height = 110;
        
        // Generate the barcode with PDF417 specifications for driver's licenses
        const options = {
          bcid: 'pdf417',
          text: aamvaString,
          scale: 2, // Reduced from 3 to 2 for better readability at smaller sizes
          height: 3.0, // Height-to-width ratio
          includetext: false,
          textxalign: 'center' as const,
          textsize: 10,
          textyalign: 'below' as const,
          textgap: 5,
          parse: false, // Preserve control characters
          rowmult: 4, // Row multiplier
          columns: 5, // Standard for driver's licenses
          quiet: 2, // Quiet zone
          margin: 10,
          rotate: 0,
          background: '#ffffff',
          foreground: '#000000',
          module: 1,
          width: 1.5 * 72, // Reduced from 2.125 to 1.5 inches
          barHeight: 0.5 * 72, // Reduced from 0.75 to 0.5 inches
        };

        await toCanvas(canvas, options);
        console.log('Barcode generated successfully');

        // Get the actual barcode dimensions
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Find the actual barcode bounds by scanning the canvas
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
          
          // Scan for non-white pixels to find actual barcode bounds
          for (let y = 0; y <canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const i = (y * canvas.width + x) * 4;
              if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
              }
            }
          }
          
          // Add padding based on PVC card dimensions
          const padding = 10;
          const barcodeWidth = maxX - minX;
          const barcodeHeight = maxY - minY;
          
          // Create a new canvas with exact PVC card barcode dimensions (match reference image)
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = barcodeWidth + (padding * 2);
          finalCanvas.height = barcodeHeight + (padding * 2);
          
          const finalCtx = finalCanvas.getContext('2d');
          if (finalCtx) {
            // Fill with white background
            finalCtx.fillStyle = '#FFFFFF';
            finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            
            // Draw only the barcode portion, centered
            finalCtx.drawImage(canvas, 
              minX, minY, barcodeWidth, barcodeHeight,
              padding, padding, barcodeWidth, barcodeHeight
            );
            
            // Convert to high-quality PNG
            const image = finalCanvas.toDataURL('image/png', 1.0);
            setBarcodeImage(image);
            
            // Clean up
            finalCanvas.remove();
          }
        }
      } finally {
        // Clean up the main canvas
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      setErrors([error.message || 'Failed to generate barcode']);
    } finally {
      setLoading(false);
    }
  };

  const downloadBarcode = () => {
    if (!barcodeImage) {
      setErrors(['Please generate a barcode first']);
      return;
    }

    // Create a temporary image to verify the barcode data
    const img = new Image();
    img.onload = () => {
      // Only proceed if the image has actual dimensions
      if (img.width > 0 && img.height > 0) {
        const link = document.createElement('a');
        link.href = barcodeImage;
        link.download = `${formData.country}-${formData.state}-license-${formData.licenseNumber || 'generated'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setErrors(['Generated barcode appears to be empty. Please try again.']);
      }
    };
    img.onerror = () => {
      setErrors(['Failed to process the barcode image. Please try again.']);
    };
    img.src = barcodeImage;
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8">AAMVA Barcode Generator</h1>
        
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-semibold mb-2">Please correct the following errors:</h3>
            <ul className="list-disc list-inside text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Personal Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleCountryChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {Object.entries(COUNTRIES).map(([code, country]) => (
                  <option key={code} value={code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State/Province</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {COUNTRIES[formData.country].states.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sex</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Race/Ethnicity</label>
              <select
                name="race"
                value={formData.race}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {RACES.map(race => (
                  <option key={race.code} value={race.code}>
                    {race.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Physical Characteristics & Address */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Physical Characteristics & Address</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Height</label>
                <div className="mt-1 flex space-x-4">
                  <select
                    value={heightUnit}
                    onChange={(e) => setHeightUnit(e.target.value)}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="inches">Inches</option>
                    <option value="feet">Feet & Inches</option>
                  </select>
                  {heightUnit === 'feet' ? (
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                        placeholder="Feet"
                        className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                        placeholder="Inches"
                        className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => updateFormData('height', e.target.value)}
                      placeholder="Height in inches"
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (pounds)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Eye Color</label>
              <select
                name="eyeColor"
                value={formData.eyeColor}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {EYE_COLORS.map(color => (
                  <option key={color.code} value={color.code}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hair Color</label>
              <select
                name="hairColor"
                value={formData.hairColor}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {HAIR_COLORS.map(color => (
                  <option key={color.code} value={color.code}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {formData.country === 'USA' ? 'ZIP Code' : 'Postal Code'}
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder={formData.country === 'USA' ? '12345 or 12345-6789' : 'A1B 2C3'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* License Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">License Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Class</label>
              <select
                name="vehicleClass"
                value={formData.vehicleClass}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {VEHICLE_CLASSES.map(vClass => (
                  <option key={vClass.code} value={vClass.code}>
                    {vClass.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Restrictions</label>
                <select
                  value={formData.restrictions}
                  onChange={(e) => updateFormData('restrictions', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Restriction</option>
                  {RESTRICTIONS.map((restriction) => (
                    <option key={restriction.code} value={restriction.code}>
                      {restriction.code} - {restriction.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Endorsements</label>
                <select
                  value={formData.endorsements}
                  onChange={(e) => updateFormData('endorsements', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Endorsement</option>
                  {ENDORSEMENTS.map((endorsement) => (
                    <option key={endorsement.code} value={endorsement.code}>
                      {endorsement.code} - {endorsement.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Date</label>
              <input
                type="date"
                name="issueDate"
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isOrganDonor"
                  checked={formData.isOrganDonor}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Organ Donor</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isVeteran"
                  checked={formData.isVeteran}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Veteran</label>
              </div>
            </div>
          </div>

          {/* DD Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">DD Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">DD Number</label>
                <input
                  type="text"
                  name="DD"
                  value={formData.DD}
                  onChange={handleInputChange}
                  placeholder="Enter DD number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">DDF - Veteran Status</label>
                <select
                  value={formData.DDF}
                  onChange={(e) => updateFormData('DDF', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">DDG - Insulin Dependent</label>
                <select
                  value={formData.DDG}
                  onChange={(e) => updateFormData('DDG', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">DDK - Hard of Hearing</label>
                <select
                  value={formData.DDK}
                  onChange={(e) => updateFormData('DDK', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">DDL - Vision Impaired</label>
                <select
                  value={formData.DDL}
                  onChange={(e) => updateFormData('DDL', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={generateBarcode}
            disabled={loading}
            className={`px-6 py-3 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Barcode'}
          </button>
          {barcodeImage && (
            <button
              onClick={downloadBarcode}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Download PNG
            </button>
          )}
        </div>

        {barcodeImage && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Generated AAMVA Barcode</h2>
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={barcodeImage}
                  alt="Generated AAMVA Barcode"
                  className="border border-gray-300 p-4"
                  style={{ width: '150px', height: '15px' }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
              The barcode is generated at actual driver's license size for direct use in templates.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
