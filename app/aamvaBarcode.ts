import { COUNTRIES, CountryConfig } from './countryData';

export interface AAMVAData {
  country: string;
  jurisdictionId: string;
  aamvaVersion: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  expiryDate: string;
  issueDate: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  documentDiscriminator: string;
  inventoryControl: string;
  auditInformation: string;
  countryId: string;
  height: string;
  weight: string;
  eyeColor: string;
  hairColor: string;
  race: string;
  restrictions: string;
  endorsements: string;
  vehicleClass: string;
  sex: string;
  isOrganDonor: boolean;
  isVeteran: boolean;
  under18Until?: string;
  under19Until?: string;
  under21Until?: string;
  DD: string;     // Organ Donor
  DDF: string;    // Veteran
  DDG: string;    // Insulin Dependent
  DDK: string;    // Hard of Hearing
  DDL: string;    // Vision Impaired
}

const formatDateForCountry = (dateStr: string, country: CountryConfig): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString();

  if (country.dateFormat === 'MMDDYYYY') {
    return `${month}${day}${year}`;
  } else {
    return `${year}${month}${day}`;
  }
};

export const validateAAMVAData = (data: AAMVAData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const country = COUNTRIES[data.country];

  if (!country) {
    errors.push('Invalid country selected');
    return { isValid: false, errors };
  }

  // Required fields validation
  const requiredFields = [
    'firstName', 'lastName', 'dateOfBirth', 
    'sex', 'height', 'weight', 
    'address', 'city', 'state', 'postalCode', 
    'licenseNumber'
  ];

  requiredFields.forEach(field => {
    if (!data[field as keyof AAMVAData] || data[field as keyof AAMVAData] === '') {
      errors.push(`${field} is required`);
    }
  });

  // Additional specific validations
  if (data.height && (isNaN(Number(data.height)) || Number(data.height) <= 0)) {
    errors.push('Height must be a positive number');
  }

  if (data.weight && (isNaN(Number(data.weight)) || Number(data.weight) <= 0)) {
    errors.push('Weight must be a positive number');
  }

  console.log('Validation Errors:', errors);

  return {
    isValid: errors.length === 0,
    errors
  };
};

const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

export function formatAAMVAString(data: AAMVAData): string {
  try {
    const country = COUNTRIES[data.country];
    if (!country) throw new Error('Invalid country');

    // Proper AAMVA header format
    const header = '@\n\x1e\rANSI ';
    const jurisdictionId = data.jurisdictionId.padStart(6, '0');
    const aamvaVersion = data.aamvaVersion.padStart(2, '0');

    // Format dates according to country format
    const formattedDOB = formatDateForCountry(data.dateOfBirth, country);
    const formattedIssue = data.issueDate ? formatDateForCountry(data.issueDate, country) : '';
    const formattedExpiry = data.expiryDate ? formatDateForCountry(data.expiryDate, country) : '';

    // Mandatory subfile type 'DL' for driver's license
    const subfileType = 'DL';

    // Construct data elements with proper separators
    const dataElements = [
      // Required header elements
      `DCT${subfileType}`,
      `DCA${jurisdictionId}`,
      `DBA${data.lastName.toUpperCase()}`,
      `DCS${data.lastName.toUpperCase()}$${data.firstName.toUpperCase()}${data.middleName ? '$' + data.middleName.toUpperCase() : ''}`,
      `DAQ${data.licenseNumber}`,
      `DBD${formattedIssue}`,
      `DBB${formattedDOB}`,
      `DBC${data.sex}`,
      `DBH${formattedExpiry}`,
      
      // Physical characteristics
      `DAU${data.weight}`,
      `DAY${data.eyeColor}`,
      `DAZ${data.hairColor}`,
      `DDE${data.height}`,
      
      // Address
      `DAG${data.address.toUpperCase()}`,
      `DAI${data.city.toUpperCase()}`,
      `DAJ${data.state.toUpperCase()}`,
      `DAK${data.postalCode}`,
      
      // Additional elements
      `DCG${data.country}`,
      `DCF${data.documentDiscriminator || ''}`,
      `DCK${data.inventoryControl || ''}`,
      
      // Optional elements
      data.restrictions ? `DBE${data.restrictions}` : null,
      data.endorsements ? `DBF${data.endorsements}` : null,
      data.vehicleClass ? `DBG${data.vehicleClass}` : null,
      
      // Additional data
      data.DD === '1' ? 'DDK1' : null,
      data.DDF === '1' ? 'DDF1' : null,
      data.DDG === '1' ? 'DDG1' : null,
      data.DDK === '1' ? 'DDK1' : null,
      data.DDL === '1' ? 'DDL1' : null
    ].filter(Boolean).join('\n');

    // Combine all parts with proper control characters
    const fullString = `${header}${jurisdictionId}${aamvaVersion}\n${dataElements}\n`;
    console.log('Generated AAMVA string:', fullString);
    return fullString;
  } catch (error) {
    console.error('Error in formatAAMVAString:', error);
    throw error;
  }
}
