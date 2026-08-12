const VOTERFOCUS = [
  ['voterfocus-hillsborough', 'Hillsborough County Supervisor of Elections', 'Hillsborough', 'hil'],
  ['voterfocus-hernando', 'Hernando County Supervisor of Elections', 'Hernando', 'hernando'],
  ['voterfocus-polk', 'Polk County Supervisor of Elections', 'Polk', 'polk'],
  ['voterfocus-citrus', 'Citrus County Supervisor of Elections', 'Citrus', 'citrus'],
  ['voterfocus-manatee', 'Manatee County Supervisor of Elections', 'Manatee', 'manatee'],
  ['voterfocus-pasco', 'Pasco County Supervisor of Elections', 'Pasco', 'pasco'],
  ['voterfocus-pinellas', 'Pinellas County Supervisor of Elections', 'Pinellas', 'pinellas'],
  ['voterfocus-sarasota', 'Sarasota County Supervisor of Elections', 'Sarasota', 'sarasota'],
  ['voterfocus-duval', 'Duval County Supervisor of Elections / Jacksonville', 'Duval', 'duval'],
  ['voterfocus-leon', 'Leon County Supervisor of Elections / Tallahassee', 'Leon', 'leon']
];

const EASYVOTE = [
  ['easyvote-clearwater', 'Clearwater', 'Pinellas', 'clearwaterfl'],
  ['easyvote-dunedin', 'Dunedin', 'Pinellas', 'dunedinfl'],
  ['easyvote-gulfport', 'Gulfport', 'Pinellas', 'gulfportfl'],
  ['easyvote-largo', 'Largo', 'Pinellas', 'largofl'],
  ['easyvote-madeira-beach', 'Madeira Beach', 'Pinellas', 'madeirabeachfl'],
  ['easyvote-oldsmar', 'Oldsmar', 'Pinellas', 'oldsmarfl'],
  ['easyvote-safety-harbor', 'Safety Harbor', 'Pinellas', 'safetyharborfl'],
  ['easyvote-st-pete-beach', 'St. Pete Beach', 'Pinellas', 'stpetebeachfl'],
  ['easyvote-st-petersburg', 'St. Petersburg', 'Pinellas', 'stpetersburgfl'],
  ['easyvote-lakeland', 'Lakeland', 'Polk', 'cityoflakelandfl'],
  ['easyvote-north-port', 'North Port', 'Sarasota', 'cityofnorthportfl']
];

const MUNICIPALITIES_BY_COUNTY = Object.freeze({
  Citrus: ['Crystal River', 'Inverness'],
  Hernando: ['Brooksville'],
  Hillsborough: ['Plant City', 'Tampa', 'Temple Terrace'],
  Manatee: ['Anna Maria', 'Bradenton', 'Bradenton Beach', 'Holmes Beach', 'Longboat Key', 'Palmetto'],
  Pasco: ['Dade City', 'New Port Richey', 'Port Richey', 'San Antonio', 'St. Leo', 'Zephyrhills'],
  Pinellas: [
    'Belleair', 'Belleair Beach', 'Belleair Bluffs', 'Belleair Shore', 'Clearwater', 'Dunedin',
    'Gulfport', 'Indian Rocks Beach', 'Indian Shores', 'Kenneth City', 'Largo', 'Madeira Beach',
    'North Redington Beach', 'Oldsmar', 'Pinellas Park', 'Redington Beach', 'Redington Shores',
    'Safety Harbor', 'Seminole', 'South Pasadena', 'St. Pete Beach', 'St. Petersburg',
    'Tarpon Springs', 'Treasure Island'
  ],
  Polk: [
    'Auburndale', 'Bartow', 'Davenport', 'Dundee', 'Eagle Lake', 'Fort Meade', 'Frostproof',
    'Haines City', 'Highland Park', 'Hillcrest Heights', 'Lake Alfred', 'Lake Hamilton', 'Lake Wales',
    'Lakeland', 'Mulberry', 'Polk City', 'Winter Haven'
  ],
  Sarasota: ['North Port', 'Sarasota', 'Venice']
});

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const SOURCE_INSTANCES = Object.freeze([
  {
    id: 'fec-schedule-a', family: 'FEC', custodian: 'Federal Election Commission',
    jurisdiction: 'Federal', state: 'READY', adapter: 'fec', electronic_scope: 'OpenFEC Schedule A electronic filings',
    locator: 'https://api.open.fec.gov/v1/schedules/schedule_a/'
  },
  {
    id: 'florida-state-contributions', family: 'FLORIDA', custodian: 'Florida Division of Elections',
    jurisdiction: 'Florida state and multicounty', state: 'READY', adapter: 'florida',
    electronic_scope: 'Florida Division of Elections searchable electronic contribution database',
    locator: 'https://dos.elections.myflorida.com/campaign-finance/contributions/'
  },
  ...VOTERFOCUS.map(([id, custodian, jurisdiction, code]) => ({
    id, family: 'VOTERFOCUS', custodian, jurisdiction, state: 'READY', adapter: 'voterfocus', code,
    electronic_scope: 'Electronically submitted reports searchable through VoterFocus; explicit dates required for historical coverage',
    locator: `https://www.voterfocus.com/CampaignFinance/cand_srch.php?c=${code}`
  })),
  ...EASYVOTE.map(([id, city, county, portal]) => ({
    id, family: 'EASYVOTE', custodian: `City of ${city}`, jurisdiction: `${city}, ${county} County`,
    state: 'READY', adapter: 'easyvote', portal,
    electronic_scope: 'Electronically submitted reports exposed by the current anonymous EasyVote search contract; may not include every filing',
    locator: `https://${portal}.easyvotecampaignfinance.com/advancedsearch/contributions`
  }))
]);

const DIRECT_BY_CITY = new Map(EASYVOTE.map(([id, city]) => [city, id]));

export const MUNICIPALITY_COVERAGE = Object.freeze(Object.entries(MUNICIPALITIES_BY_COUNTY).flatMap(([county, names]) =>
  names.map((name) => {
    const countySource = `voterfocus-${county.toLowerCase()}`;
    const custodians = [countySource];
    if (DIRECT_BY_CITY.has(name)) custodians.push(DIRECT_BY_CITY.get(name));
    return {
      id: `fl-${slug(name)}`,
      municipality: name,
      county,
      status: custodians.length > 0 ? 'VERIFIED_ELECTRONIC_CUSTODIAN' : 'UNRESOLVED',
      source_instance_ids: custodians,
      paper_pdf_policy: 'NO_MACHINE_SEARCHABLE_ELECTRONIC_SOURCE'
    };
  })
));

export function sourceById(id) {
  return SOURCE_INSTANCES.find((source) => source.id === id) || null;
}

export function publicRegistry() {
  const families = SOURCE_INSTANCES.reduce((acc, source) => {
    acc[source.family] = (acc[source.family] || 0) + 1;
    return acc;
  }, {});
  return {
    schema: 'td613.giving.source-registry/v1',
    generated_from: 'explicit-release-registry',
    source_instance_count: SOURCE_INSTANCES.length,
    family_counts: families,
    municipalities: {
      unique_count: MUNICIPALITY_COVERAGE.length,
      coverage: MUNICIPALITY_COVERAGE
    },
    instances: SOURCE_INSTANCES,
    coverage_claim: 'Registry evidence is live-contract-sensitive and may be downgraded to DRIFTED, PARTIAL, or UNAVAILABLE.',
    paper_pdf_policy: 'NO_MACHINE_SEARCHABLE_ELECTRONIC_SOURCE'
  };
}
