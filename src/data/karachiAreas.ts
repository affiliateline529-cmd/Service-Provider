import { KarachiAreaInfo } from '../types';

export const KARACHI_AREAS: KarachiAreaInfo[] = [
  { name: 'Gulshan-e-Iqbal', district: 'East', popular: true },
  { name: 'Gulistan-e-Jauhar', district: 'East', popular: true },
  { name: 'North Nazimabad', district: 'Central', popular: true },
  { name: 'Nazimabad', district: 'Central', popular: true },
  { name: 'DHA (Defence)', district: 'South', popular: true },
  { name: 'Clifton', district: 'South', popular: true },
  { name: 'Saddar', district: 'South', popular: true },
  { name: 'PECHS', district: 'East', popular: true },
  { name: 'Federal B Area', district: 'Central', popular: true },
  { name: 'Bahadurabad', district: 'East', popular: true },
  { name: 'Tariq Road', district: 'East', popular: true },
  { name: 'Shahrah-e-Faisal', district: 'East', popular: true },
  { name: 'Korangi', district: 'Korangi', popular: true },
  { name: 'Malir', district: 'Malir', popular: true },
  { name: 'Buffer Zone', district: 'Central' },
  { name: 'Liaquatabad', district: 'Central' },
  { name: 'Gulberg', district: 'Central' },
  { name: 'New Karachi', district: 'Central' },
  { name: 'Surjani Town', district: 'West' },
  { name: 'Orangi Town', district: 'West' },
  { name: 'Lyari', district: 'South' },
  { name: 'SITE Area', district: 'West' },
  { name: 'Keamari', district: 'Keamari' },
  { name: 'Boat Basin', district: 'South' },
  { name: 'Defense View', district: 'South' },
  { name: 'Shah Faisal Colony', district: 'Korangi' },
  { name: 'Scheme 33', district: 'East', popular: true },
  { name: 'Landhi', district: 'Korangi' },
  { name: 'Garden East & West', district: 'South' },
  { name: 'Soldier Bazaar', district: 'East' },
  { name: 'Gulshan-e-Maymar', district: 'West' },
  { name: 'Cantt', district: 'South' },
  { name: 'Kharadar & Mithadar', district: 'South' }
];

export const KARACHI_AREA_NAMES = KARACHI_AREAS.map(a => a.name);
