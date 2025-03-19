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
    // The header must follow exact format: '@\n\u001e\rANSI '
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

    // Important: this header format is expected by most scanners
    // ANSI XXXXXX9999YYDL - where XXXXXX is jurisdiction ID, 9999 is version, YY is num entries
    const subfileHeader = `${header}${jurisdictionId}${aamvaVersion}${numEntries}${subfileType}`;

    // Construct data elements with exact AAMVA order and format according to reference implementation
    // Using the exact format from the reference barcode that scans correctly
    const dataElements = [];
    
    // First field should be DL with license number (key for most scanners)
    dataElements.push(`DL${data.licenseNumber}`);
    
    // DAQ field is essential for proper name parsing
    dataElements.push(`DAQ${data.licenseNumber}`);
    
    // Document fields
    if (data.documentDiscriminator) dataElements.push(`DCF${data.documentDiscriminator}`);
    
    // Vehicle class, restrictions and endorsements
    if (data.vehicleClass) dataElements.push(`DCA${data.vehicleClass}`);
    dataElements.push(`DCB${data.restrictions || 'NONE'}`);
    dataElements.push(`DCD${data.endorsements || 'NONE'}`);
    
    // Name fields - must be in proper order for most scanners
    dataElements.push(`DCS${data.lastName.toUpperCase()}`);
    dataElements.push(`DAC${data.firstName.toUpperCase()}`);
    if (data.middleName) dataElements.push(`DAD${data.middleName.toUpperCase()}`);
    
    // Date fields
    if (formattedIssue) dataElements.push(`DBD${formattedIssue}`);
    dataElements.push(`DBB${formattedDOB}`);
    dataElements.push(`DBA${formattedExpiry}`);
    
    // Physical description
    dataElements.push(`DBC${data.sex}`);
    dataElements.push(`DAY${data.eyeColor}`);
    dataElements.push(`DAU${data.height}`);
    if (data.weight) dataElements.push(`DAW${data.weight}`);
    if (data.hairColor) dataElements.push(`DAZ${data.hairColor}`);
    
    // Address fields
    dataElements.push(`DAG${data.address.toUpperCase()}`);
    dataElements.push(`DAI${data.city.toUpperCase()}`);
    dataElements.push(`DAJ${data.state.toUpperCase()}`);
    dataElements.push(`DAK${data.postalCode}`);
    
    // Country information
    dataElements.push(`DCG${data.countryId || 'USA'}`);
    
    // Truncation indicators
    dataElements.push(`DDE${data.lastName.length > 40 ? 'T' : 'N'}`);
    dataElements.push(`DDF${data.firstName.length > 40 ? 'T' : 'N'}`);
    if (data.middleName) dataElements.push(`DDG${data.middleName.length > 40 ? 'T' : 'N'}`);
    
    // Optional elements
    if (data.auditInformation) dataElements.push(`DCJ${data.auditInformation}`);
    if (data.race) dataElements.push(`DCL${data.race}`);
    
    // Special indicators
    if (data.isOrganDonor) dataElements.push('DDK1');
    if (data.isVeteran) dataElements.push('DDF1');
    
    // Under age dates
    if (data.under18Until) dataElements.push(`DDH${formatDateForCountry(data.under18Until, country)}`);
    if (data.under19Until) dataElements.push(`DDI${formatDateForCountry(data.under19Until, country)}`);
    if (data.under21Until) dataElements.push(`DDJ${formatDateForCountry(data.under21Until, country)}`);

    // Join elements with newlines - this format is critical for scanner recognition
    const dataElementsStr = dataElements.join('\n');

    // Combine with proper control characters - ending with \r is critical
    const fullString = `${subfileHeader}\n${dataElementsStr}\r`;
    console.log('Generated AAMVA string:', fullString);
    return fullString;
  } catch (error) {
    console.error('Error in formatAAMVAString:', error);
    throw error;
  }
}
