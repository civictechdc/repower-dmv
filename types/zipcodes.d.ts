declare module 'zipcodes' {
  const zipcodes: {
    distance: (zipA: string, zipB: string) => number | undefined;
    lookup: (zip: string) => { latitude: number; longitude: number } | undefined;
  };
  export default zipcodes;
}

