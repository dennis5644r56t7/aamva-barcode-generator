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

export const formatAAMVAString = (data: AAMVAData): string => {
  const subfileHeader = `@\nANSI 636020090001DL00310242DLDAQ${data.licenseNumber}`;
  
  const dataElements = [
    `DCS${data.lastName.toUpperCase()}`,
    'DDEN',
    `DAC${data.firstName.toUpperCase()}`,
    'DDFN',
    data.middleName ? `DADMIDDLENAME${data.middleName.toUpperCase()}` : '',
    'DDGN',
    'DCAD',
    'DCBNONE',
    'DCDNONE',
    `DBD${formatDateForCountry(data.expiryDate, COUNTRIES[data.country])}`,
    `DBB${formatDateForCountry(data.dateOfBirth, COUNTRIES[data.country])}`,
    `DBA${formatDateForCountry(data.expiryDate, COUNTRIES[data.country])}`,
    'DBC1',
    `DAU${data.height} in`,
    'DAYBLK',
    `DAG${data.address.toUpperCase()}`,
    `DAI${data.city.toUpperCase()}`,
    `DAJ${data.state.toUpperCase()}`,
    `DAK${data.postalCode}`,
    'DCFNONE',
    'DCGUSA',
    'DAZHAZ',
    'DDAF',
    'DDB06072016',
    'DDD1'
  ].filter(Boolean).join('\n');

  const fullString = `${subfileHeader}\n${dataElements}\r`;
  console.log('AAMVA String:', fullString);
  return fullString;
};
