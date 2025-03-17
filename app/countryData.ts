export interface CountryConfig {
  name: string;
  code: string;
  states: Array<{ code: string; name: string; issuerId: string }>;
  dateFormat: 'MMDDYYYY' | 'YYYYMMDD';
  barcodePrefix: string;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  USA: {
    name: 'United States',
    code: 'USA',
    dateFormat: 'MMDDYYYY',
    barcodePrefix: '@\n\x1e\rANSI ',
    states: [
      { code: 'AL', name: 'Alabama', issuerId: '636033' },
      { code: 'AK', name: 'Alaska', issuerId: '636059' },
      { code: 'AZ', name: 'Arizona', issuerId: '636026' },
      { code: 'AR', name: 'Arkansas', issuerId: '636021' },
      { code: 'CA', name: 'California', issuerId: '636014' },
      { code: 'CO', name: 'Colorado', issuerId: '636020' },
      { code: 'CT', name: 'Connecticut', issuerId: '636006' },
      { code: 'DE', name: 'Delaware', issuerId: '636011' },
      { code: 'DC', name: 'District of Columbia', issuerId: '636043' },
      { code: 'FL', name: 'Florida', issuerId: '636010' },
      { code: 'GA', name: 'Georgia', issuerId: '636055' },
      { code: 'HI', name: 'Hawaii', issuerId: '636047' },
      { code: 'ID', name: 'Idaho', issuerId: '636050' },
      { code: 'IL', name: 'Illinois', issuerId: '636035' },
      { code: 'IN', name: 'Indiana', issuerId: '636037' },
      { code: 'IA', name: 'Iowa', issuerId: '636018' },
      { code: 'KS', name: 'Kansas', issuerId: '636022' },
      { code: 'KY', name: 'Kentucky', issuerId: '636046' },
      { code: 'LA', name: 'Louisiana', issuerId: '636007' },
      { code: 'ME', name: 'Maine', issuerId: '636041' },
      { code: 'MD', name: 'Maryland', issuerId: '636003' },
      { code: 'MA', name: 'Massachusetts', issuerId: '636002' },
      { code: 'MI', name: 'Michigan', issuerId: '636032' },
      { code: 'MN', name: 'Minnesota', issuerId: '636038' },
      { code: 'MS', name: 'Mississippi', issuerId: '636051' },
      { code: 'MO', name: 'Missouri', issuerId: '636030' },
      { code: 'MT', name: 'Montana', issuerId: '636008' },
      { code: 'NE', name: 'Nebraska', issuerId: '636054' },
      { code: 'NV', name: 'Nevada', issuerId: '636049' },
      { code: 'NH', name: 'New Hampshire', issuerId: '636039' },
      { code: 'NJ', name: 'New Jersey', issuerId: '636036' },
      { code: 'NM', name: 'New Mexico', issuerId: '636009' },
      { code: 'NY', name: 'New York', issuerId: '636001' },
      { code: 'NC', name: 'North Carolina', issuerId: '636004' },
      { code: 'ND', name: 'North Dakota', issuerId: '636034' },
      { code: 'OH', name: 'Ohio', issuerId: '636023' },
      { code: 'OK', name: 'Oklahoma', issuerId: '636052' },
      { code: 'OR', name: 'Oregon', issuerId: '636029' },
      { code: 'PA', name: 'Pennsylvania', issuerId: '636025' },
      { code: 'RI', name: 'Rhode Island', issuerId: '636052' },
      { code: 'SC', name: 'South Carolina', issuerId: '636005' },
      { code: 'SD', name: 'South Dakota', issuerId: '636042' },
      { code: 'TN', name: 'Tennessee', issuerId: '636053' },
      { code: 'TX', name: 'Texas', issuerId: '636015' },
      { code: 'UT', name: 'Utah', issuerId: '636040' },
      { code: 'VT', name: 'Vermont', issuerId: '636024' },
      { code: 'VA', name: 'Virginia', issuerId: '636000' },
      { code: 'WA', name: 'Washington', issuerId: '636045' },
      { code: 'WV', name: 'West Virginia', issuerId: '636061' },
      { code: 'WI', name: 'Wisconsin', issuerId: '636031' },
      { code: 'WY', name: 'Wyoming', issuerId: '636060' }
    ]
  },
  CAN: {
    name: 'Canada',
    code: 'CAN',
    dateFormat: 'YYYYMMDD',
    barcodePrefix: '@\n\x1e\rANSI ',
    states: [
      { code: 'AB', name: 'Alberta', issuerId: '604432' },
      { code: 'BC', name: 'British Columbia', issuerId: '604433' },
      { code: 'MB', name: 'Manitoba', issuerId: '604434' },
      { code: 'NB', name: 'New Brunswick', issuerId: '636017' },
      { code: 'NL', name: 'Newfoundland and Labrador', issuerId: '636016' },
      { code: 'NT', name: 'Northwest Territories', issuerId: '604439' },
      { code: 'NS', name: 'Nova Scotia', issuerId: '636013' },
      { code: 'NU', name: 'Nunavut', issuerId: '604427' },
      { code: 'ON', name: 'Ontario', issuerId: '636012' },
      { code: 'PE', name: 'Prince Edward Island', issuerId: '604426' },
      { code: 'QC', name: 'Quebec', issuerId: '604428' },
      { code: 'SK', name: 'Saskatchewan', issuerId: '604429' },
      { code: 'YT', name: 'Yukon', issuerId: '604435' }
    ]
  },
  ZAF: {
    name: 'South Africa',
    code: 'ZAF',
    dateFormat: 'YYYYMMDD',
    barcodePrefix: '@\n\x1e\rANSI ',
    states: [
      { code: 'GP', name: 'Gauteng', issuerId: '710000' },
      { code: 'WC', name: 'Western Cape', issuerId: '710001' },
      { code: 'EC', name: 'Eastern Cape', issuerId: '710002' },
      { code: 'KZN', name: 'KwaZulu-Natal', issuerId: '710003' },
      { code: 'MP', name: 'Mpumalanga', issuerId: '710004' },
      { code: 'NW', name: 'North West', issuerId: '710005' },
      { code: 'FS', name: 'Free State', issuerId: '710006' },
      { code: 'LP', name: 'Limpopo', issuerId: '710007' },
      { code: 'NC', name: 'Northern Cape', issuerId: '710008' }
    ]
  }
};
