import { Base } from '../_base/base';
import { BoatnetDate } from '../_common/boatnet-date';

export const PortTypeName = 'port';

// TODO add an at-sea transfer Port ID to DB

export interface Port extends Base {
  name?: string;
  code?: string;
  group?: string;
  state?: string;

  legacy?: {
    portId?: number;
    obsprodLoadDate?: BoatnetDate;

    // Possibly legacy, unclear what these values represent.
    ifqPortId?: number;
    ifqPortCode?: number;
  };
}
