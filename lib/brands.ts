export type BrandKey = 'alnyx' | 'multiple-myeloma' | 'rucomab' | 'vinvoq';

export interface BrandDef {
  key: BrandKey;
  name: string;
  populated: boolean;
}

export const BRANDS: BrandDef[] = [
  { key: 'alnyx', name: 'Alnyx', populated: true },
  { key: 'multiple-myeloma', name: 'Multiple Myeloma', populated: false },
  { key: 'rucomab', name: 'Rucomab', populated: false },
  { key: 'vinvoq', name: 'Vinvoq', populated: false },
];

export const ACTIVE_BRAND_DEFAULT: BrandKey = 'alnyx';
