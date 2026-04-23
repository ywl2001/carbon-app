export type MetadataAttribute = {
    trait_type: string;
    value: string | number;
  };
  
  export type Metadata = {
    name?: string;
    description?: string;
    image?: string;
    attributes?: MetadataAttribute[];
  };