import { Base } from '../_base/base';
import { BoatnetDate, Measurement } from '.';
import { Point } from 'geojson'; // GeoJSON https://tools.ietf.org/html/rfc7946
import {
  Beaufort,
  Confidence,
  Media,
  BirdBand,
  Species
} from '../_lookups/index';

declare type SightingConditions = string; // TODO Review Good/ Fair/ Poor, same as confidence?
declare type Behavior = string; // TODO
declare type LengthEstimate = any; // TODO Choices: < 3, 3-8, 8-16, 16-26, > 26 meters - TODO Ryan to review usefulness
declare type DescriptorIcon = any; // TODO Pick-list images of Cetacea and Pinniped Descriptions (Silhouettes)

interface SilhouetteDescriptor {
  image?: DescriptorIcon; // Pick-list images of Cetacea and Pinniped Descriptions (Silhouettes)
  comments?: string; // colors, scars etc
}

interface GearPresentComment {
  gearType?: string; // TODO lookup
  comments?: string; // gear color etc
}

export interface SightingEvent extends Base {
  species?: Species;
  confidentOfSpecies?: Confidence; // Y/N/? Might be useful?
  sightingDate?: BoatnetDate;
  location?: Point;
  beaufort?: Beaufort;
  sightingConditions?: SightingConditions;
  minNumSighted?: number;
  maxNumSighted?: number;
  bestNumSighted?: number;
  closestApproach?: Measurement;
  duration?: Measurement; // in minutes
  sightingCue?: string;
  mediaData?: Media[]; // Derive media present for analyst view
  animalBehavior?: Behavior[]; // spy-hopping, tail raised on dive etc
  bodyLengthEstimates?: LengthEstimate[]; // multiple animals - TODO Ryan to review usefulness

  // for turtles (no data yet)
  tagColor?: string;
  birdBands?: BirdBand[]; // for birds
  // for pinnipeds
  brandId?: string;
  silhouetteDescriptor?: SilhouetteDescriptor[];
  gearPresent?: GearPresentComment;

  legacy?: {
    waterTemp?: Measurement;
  };
}
