// Ashop Haul
import { LocationEvent, Measurement, CouchID } from '../_common/index';
import { GearType } from '../_lookups/index';
import { BaseOperation, BaseCatch } from '../_base/index';
import { AshopCatch } from './ashop-catch';

export const AshopHaulTypeName = 'ashop-haul';

declare type AshopGearPerformance = string; // TODO
interface EstimatedDiscard {
  measurement: Measurement; // kg
  weightMethod: string; // TODO lookup AshopWeightMethod
  source: string; // TODO source lookup
  // Sources: Calculated (observer sample expanded), Visual,
  // Catcher Vessel, Pre-sort (Not expanded- could be Calculated source in separate sample)
}

export interface AshopHaul extends BaseOperation {
  haulNum?: number;

  startFishingLocation?: LocationEvent; // ETL from Deploy
  endFishingLocation?: LocationEvent; // ETL from Retrieval

  bottomDepth?: Measurement;
  fishingDepth?: Measurement;
  // ETL units from DEPTH_METER_FATHOM
  // TODO Keep units in Fathoms - convert from Meters if needed

  observerEstimatedCatch?: {
    measurement: Measurement; // kg
    weightMethod: string; // TODO lookup AshopWeightMethod
  };

  vesselEstimatedCatch?: {
    measurement: Measurement; // MT
    weightMethod: string; // TODO lookup AshopWeightMethod
  };

  officialTotalCatch?: Measurement;
  // Calculated -
  // use observerEstimatedCatch if available,
  // otherwise vesselEstimatedCatch

  observerEstimatedDiscards?: EstimatedDiscard[];

  // Calculated- sum of observerEstimatedDiscards
  totalEstimatedDiscard?: Measurement;

  gearType?: GearType;
  gearPerformance?: AshopGearPerformance; // TODO Lookup
  mammalMonitorPercent?: number; // 0 or 100
  isBirdShortwired?: boolean;
  isGearLost?: boolean;
  tribalDelivery?: string; // TODO name of tribe LOOKUP
  sampleDesignType?: string; // TODO lookup

  samples?: AshopCatch[];

  legacy?: {
    haulSeq?: number;
    deliveryVesselAdfg?: string;
    locationCode?: string; // R (Retrieval) or N (Noon)
    volume?: Measurement;
    density?: Measurement;
    haulPurposeCode?: string;
    cdqCode?: string;
    rbtCode?: string;
    rstCode?: string;
    birdHaulbackCode?: string;
    sampleUnit?: string;
  };
}
