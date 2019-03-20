// Unique fields of WCGOP trips
import { BaseTrip } from '../_base/base-trip';
import {
  Program,
  Fishery,
  FirstReceiver,
  TripStatus,
  LogbookType,
  Contact,
  Certificate,
  Waiver,
  GearType,
  CouchID
} from '../_common/index';

import { WcgopSightingEvent, WcgopFishTicket } from './index';
import { WcgopBrd } from './wcgop-brd';
import { WcgopHlfc } from './wcgop-hlfc';

export const WcgopTripTypeName = 'wcgop-trip';

export interface WcgopTrip extends BaseTrip {
  observer?: Contact; // formerly User ID, TODO Specifics
  program?: Program;
  isPartialTrip?: boolean;
  fishingDays?: number;
  fishery?: Fishery;
  crewSize?: number;
  firstReceivers?: FirstReceiver[]; // FR lookups are in Permits DB
  logbookNum?: number;
  logbookType?: LogbookType;
  observerLogbookNum?: number;
  isExpanded?: boolean;
  doExpand?: boolean; // should expand or not after manual calculation
  isFishProcessed?: boolean;
  tripStatus?: TripStatus;
  isDataQualityPassing?: boolean;
  debriefer?: Contact;
  sightingEvents?: WcgopSightingEvent[];
  sightingEventOps?: CouchID[]; // Operation UUID's where this sighting occurred
  brd?: WcgopBrd[];
  hlfc?: WcgopHlfc[];

  fishTickets?: WcgopFishTicket[];
  certificates?: Certificate[];
  waiver?: Waiver;
  intendedGearType?: GearType; // only for when there is no Haul data
  legacy?: {
    tripId?: number;
    otcKp?: number;
    totalHooksKp?: number;
    export?: number; // status of expansion, ETL to isExpanded
    runTer?: boolean;
    evaluationId?: number; // TODO Evaluation parent
    permitNum?: string; // ETL to Certificate
    licenseNum?: string; // ETL to Certificate
    isNoFishingActivity?: boolean; // did fishing NOT occur?
  };
}
