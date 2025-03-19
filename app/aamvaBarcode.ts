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

    // Exact AAMVA header format with control characters
    const header = '@\n\u001e\rANSI ';
    const jurisdictionId = data.jurisdictionId.padStart(6, '0');
    const aamvaVersion = data.aamvaVersion.padStart(2, '0');
    const numEntries = '01';  // Fixed to 1 entry for driver's license

    // Format dates according to country format
    const formattedDOB = formatDateForCountry(data.dateOfBirth, country);
    const formattedIssue = data.issueDate ? formatDateForCountry(data.issueDate, country) : '';
    const formattedExpiry = data.expiryDate ? formatDateForCountry(data.expiryDate, country) : '';

    // Mandatory subfile type 'DL' for driver's license
    const subfileType = 'DL';
    const subfileHeader = `${header}${jurisdictionId}${aamvaVersion}${numEntries}${subfileType}`;

    // Construct data elements with exact AAMVA order and format
    const dataElements = [
      // Required header elements
      `DAQ${data.licenseNumber}`,
      `DCS${data.lastName.toUpperCase()}`,
      `DAC${data.firstName.toUpperCase()}`,
      `DAD${data.middleName ? data.middleName.toUpperCase() : ''}`,
      `DBD${formattedIssue}`,
      `DBB${formattedDOB}`,
      `DBA${formattedExpiry}`,
      `DBC${data.sex}`,
      `DAY${data.eyeColor}`,
      `DAU${data.height}`,
      
      // Address
      `DAG${data.address.toUpperCase()}`,
      `DAI${data.city.toUpperCase()}`,
      `DAJ${data.state.toUpperCase()}`,
      `DAK${data.postalCode}`,
      
      // Additional required elements
      `DCF${data.documentDiscriminator || ''}`,
      `DCG${data.countryId || 'USA'}`,
      
      // Name truncation indicators (N = not truncated)
      `DDE${data.lastName.length > 40 ? 'T' : 'N'}`,
      `DDF${data.firstName.length > 40 ? 'T' : 'N'}`,
      `DDG${data.middleName && data.middleName.length > 40 ? 'T' : 'N'}`,
      
      // Physical characteristics
      `DAZ${data.hairColor}`,
      
      // Optional elements
      data.restrictions ? `DCB${data.restrictions}` : null,
      data.endorsements ? `DCD${data.endorsements}` : null,
      data.vehicleClass ? `DCA${data.vehicleClass}` : null,
      
      // Audit information
      data.auditInformation ? `DCJ${data.auditInformation}` : null,
      
      // Race/ethnicity
      data.race ? `DCL${data.race}` : null,
      
      // Weight
      data.weight ? `DAW${data.weight}` : null,
      
      // Additional elements
      data.isOrganDonor ? 'DDK1' : null,
      data.isVeteran ? 'DDF1' : null,
      
      // Under age dates
      data.under18Until ? `DDH${formatDateForCountry(data.under18Until, country)}` : null,
      data.under19Until ? `DDI${formatDateForCountry(data.under19Until, country)}` : null,
      data.under21Until ? `DDJ${formatDateForCountry(data.under21Until, country)}` : null
    ].filter(Boolean).join('\n');

    // Combine with proper control characters
    const fullString = `${subfileHeader}\n${dataElements}\r`;
    console.log('Generated AAMVA string:', fullString);
    return fullString;
  } catch (error) {
    console.error('Error in formatAAMVAString:', error);
    throw error;
  }
}
