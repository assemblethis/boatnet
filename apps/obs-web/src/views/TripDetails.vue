<template>
    <div class="q-pa-md  q-gutter-md">
        <q-card class="my-card">
            <q-card-section>
                <!-- {{ this.$store.state.currentTrip.trip_num }} -->
                <div class="text-h6" style="margin-bottom: 10px;">
                    {{ vessel.activeVessel.vesselName }} Trip # {{ trip.activeTrip.tripNum }}
                <q-icon
                    v-if="trip.activeTrip.isSelected"
                    name="check_circle"
                    class="text-primary"
                    style="font-size: 32px; float: right"
                    title="Trip is Selected">
                </q-icon>
                <br>
                <span v-if="trip.activeTrip.fishery.name">{{ trip.activeTrip.fishery.name }}</span>
                </div>

            <q-list>
                <div class="row items-start">
              <q-item>
                <q-item-section>
                    <div>
                        <div class="text-subtitle2">Departure Date</div>
                        <q-date
                            v-model="departureDate"
                            color="green"
                            dark
                            >
                        </q-date>
                    </div>
                </q-item-section>
                </q-item>

              <q-item>
                <q-item-section>
                    <div>
                        <div class="text-subtitle2">Return Date</div>
                        <q-date
                            v-model="returnDate"
                            :options="returnDateOptionsFn"
                            color="red"
                            dark
                            >
                        </q-date>
                    </div>
                    </q-item-section>
                </q-item>
                </div>
                </q-list>

                <q-select
                label="Start Port"
                v-model="trip.activeTrip.departurePort"
                :options="ports"
                @filter="startPortsFilterFn"
                :option-label="opt => opt.name"
                option-value="_id"
                dense
                use-input
                stack-label
                >
                </q-select>

                <q-select
                v-model="trip.activeTrip.returnPort"
                :dense="true"
                label="End Port"
                @filter="endPortsFilterFn"
                use-input
                stack-label
                :option-label="opt => opt.name"
                option-value="_id"
                :options="ports"
                >
                </q-select>

                <q-select v-model="trip.activeTrip.fishery" :dense="true" label="Fishery" stack-label :rules="[val => !!val || 'Field is required']" @filter="fisheriesFilterFn" use-input option-label="name" option-value="_id" :options="fisheryOptions"></q-select>

                <p><strong>Permits</strong></p>

                <q-select
                v-model="trip.activeTrip.permits"
                bg-color="white"
                color="primary"
                multiple
                use-chips
                use-input
                stack-label
                :option-label="opt => opt.permitNumber + ' - ' + opt.permitType"
                option-value="permitNumber"
                @filter = "permitsFilterFn"
                :options="permits"
                style="width: 100%"
                >
                    <template v-slot:selected-item="scope">
                        <q-chip
                            removable
                            dense
                            @remove="scope.removeAtIndex(scope.index)"
                            :tabindex="scope.tabindex"
                            color="primary"
                            text-color="white"
                            class="q-ma-none"
                            >
                            <q-avatar color="primary" text-color="white" icon="local_offer" />
                            <span v-if="scope.opt.label">{{ scope.opt.label }}</span>
                            <span v-else>{{ scope.opt.permitNumber }}</span>
                        </q-chip>
                    </template>
                </q-select>

                <!-- <q-btn round color="primary" icon="add" size="sm" @click="prompt=true" style="float:right"/> -->

                <!-- <p><strong>Messages</strong></p>
                <div v-if="tripMessages.length > 0">
                    <br>
                    <q-list bordered separator class="rounded-borders">
                        <q-item clickable :dense="true" v-for="(message, i) in tripMessages" :key="message.datetime">
                            <q-item-section>
                                <q-item-label class="text-primary">{{ message.author.name }}
                                    <span style="float:right">
                                    {{ getTimeText(message.datetime) }}
                                    </span>
                                </q-item-label>
                                <q-item-label><strong>{{ message.text }}</strong></q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div> -->

                    <!-- <q-dialog v-model="prompt" persistent>
                    <q-card style="min-width: 300px">
                        <q-card-section>
                        <div class="text-h6">New Message</div>
                        </q-card-section>

                        <q-card-section>
                        <q-input dense v-model="newMessage" autofocus @keyup.enter="addMessage" />
                        </q-card-section>

                        <q-card-actions align="right" class="text-primary">
                        <q-btn flat label="Cancel" @click="prompt = false" />
                        <q-btn flat label="Add" @click="addMessage" />
                        </q-card-actions>
                    </q-card>
                    </q-dialog> -->

            </q-card-section>

            <q-card-actions v-if="trip.newTrip" align="right" class="text-primary">
                <q-btn label="Cancel" @click="goToTrips"/>
                <q-btn label="Create Trip" color="primary" @click="createTrip"/>
            </q-card-actions>
            <q-card-actions v-else align="right" class="text-primary">
                <q-btn label="Cancel" @click="goToTrips"></q-btn>
                <q-btn label="Update" color="primary" @click="updateTrip"></q-btn>
            </q-card-actions>
        </q-card>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { date } from 'quasar';
import { TripState, PermitState, UserState, GeneralState, VesselState, AlertState } from '../_store/types/types';
import { Permit, OTSTarget } from '@boatnet/bn-models';

import moment from 'moment';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';

import {
  WcgopTrip,
  WcgopTripTypeName,
  Port,
  PortTypeName,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  Vessel,
  VesselTypeName,
  Fishery
} from '@boatnet/bn-models';

@Component
export default class TripDetails extends Vue {

  @State('trip') private trip!: TripState;
  @State('permit') private permit!: PermitState;
  @State('user') private user!: UserState;
  @State('general') private general!: GeneralState;
  @State('vessel') private vessel!: VesselState;

  @State('alert') private alert!: AlertState;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

    // private get permits() {
    //     return this.permit.permits.map( (permit: any) => (permit)
    //     );
    // }

    private prompt = false;
    // private newMessage: string = '';

    // private get ports() {
    //     return this.general.ports.sort();
    // }

    private portOptions: string[] = [];
    private fisheryOptions: Fishery[] = [];

    // private vessels = [];
    private permits: Permit[] = [];
    private otsTargets: OTSTarget[] = [];
    private ports: any[] = [];

    constructor() {
        super();

    }

    // private addMessage() {
    //     if (this.trip.activeTrip) {
    //         this.trip.activeTrip.messages.push({
    //                             author: this.user.activeUser ,
    //                             datetime: moment().format() ,
    //                             text: this.newMessage
    //                             });
    //         this.newMessage = '';
    //         this.prompt = false;
    //     }
    //     }

    // private get tripMessages() {
    //     if (this.trip.activeTrip) {
    //         if (this.trip.activeTrip.messages) {
    //             return this.trip.activeTrip.messages.reverse();
    //         } else {
    //             return [];
    //             }
    //         } else {
    //             return [];
    //         }
    //     }

    private fisheriesFilterFn(val: string, update: any, abort: any) {
    update(
        async () => {
            try {
                const db = pouchService.db;
                const queryOptions: ListOptions = {
                limit: 5,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false
                };

                const fisheries = await db.query(
                pouchService.lookupsDBName,
                'obs_web/all_fisheries',
                queryOptions
                );
                this.fisheryOptions = fisheries.rows.map((row: any) => row.value);
            } catch (err) {
                this.errorAlert(err);
            }
        }
        );
    }

    private permitsFilterFn(val: string, update: any, abort: any) {
        console.log(this.permit.permits);
        if (val === '') {
            update(() => {
                this.permits = this.permit.permits;
            });
            return;
            }
        update(() => {
            const searchString = val.toLowerCase();
            this.permits = this.permit.permits.filter(
                (permit) => permit.permitNumber.toLowerCase().indexOf(searchString.toLowerCase()) > -1
            );
        });
    }


    private startPortsFilterFn(val: string, update: any, abort: any) {
    update(
        async () => {
            try {
                const db = pouchService.db;
                const queryOptions = {
                limit: 5,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false,
                include_docs: true
                };

                const ports = await db.query(
                    pouchService.lookupsDBName,
                    'optecs_trawl/all_port_names',
                    queryOptions
                    );
                this.ports = ports.rows.map((row: any) => row.doc);
            } catch (err) {
                this.errorAlert(err);
            }
        }
    );
    }

    private endPortsFilterFn(val: string, update: any, abort: any) {
    update(
        async () => {
            try {
                const db = pouchService.db;
                const queryOptions = {
                limit: 5,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false,
                include_docs: true
                };

                const ports = await db.query(
                    pouchService.lookupsDBName,
                    'optecs_trawl/all_port_names',
                    queryOptions
                    );
                this.ports = ports.rows.map((row: any) => row.doc);
                this.ports.unshift({name: 'SAME AS START'});
            } catch (err) {
                this.errorAlert(err);
            }
        }
    );
    }

    // private updatePorts(val: string, update: any, abort: any, portType: any) {
    // update(async () => {
    //   try {
    //     const db = pouchService.db;
    //     const queryOptions: ListOptions = {
    //       limit: 5,
    //       start_key: val.toLowerCase(),
    //       inclusive_end: true,
    //       descending: false
    //     };

    //     const ports = await db.query(
    //       pouchService.lookupsDBName,
    //       'optecs_trawl/all_port_names',
    //       queryOptions
    //     );
    //     this.portOptions = ports.rows.map((port: any) => port.value);
    //     if (portType === 'end') {
    //         this.portOptions.push('SAME AS START');
    //     }
    //   } catch (err) {
    //     this.errorAlert(err);
    //   }
    // });
    // }

    // private startPortsFilterFn(val: string, update: any, abort: any) {
    //     this.updatePorts(val, update, abort, 'start');
    //     }

    // private endPortsFilterFn(val: string, update: any, abort: any) {
    //     this.updatePorts(val, update, abort, 'end');
    //     }

    // private deleteTrip() {
    //     this.trip.trips.pop();
    //     this.trip.activeTrip = null;
    //     this.$router.push({path: '/trips/'});
    // }

    private getStatus(otsTarget: OTSTarget) {
        if ( (moment(otsTarget.effectiveDate) <= moment() && moment() <= moment(otsTarget.expirationDate)) && ( otsTarget.status !== 'Inactive' )) {
            return 'Active';
        } else {
            return 'Inactive';
        }
    }

    private createTrip() {
        // this is where the pouch code to save the trip goes
        let activeOTSTarget;
        for (const otsTarget of this.otsTargets) {
            if (this.trip.activeTrip && this.trip.activeTrip.fishery) {
                if (this.getStatus(otsTarget) === 'Active' && otsTarget.targetType === 'Fishery Wide' && otsTarget.fishery === this.trip.activeTrip.fishery.name) {
                    activeOTSTarget = otsTarget;
                }
            }
        }
        for (const otsTarget of this.otsTargets) {
            if (this.getStatus(otsTarget) === 'Active' && otsTarget.targetVessel && this.trip.activeTrip && this.trip.activeTrip.vessel && this.trip.activeTrip.fishery) {
                const otsVesselId = otsTarget.targetVessel.coastGuardNumber ? otsTarget.targetVessel.coastGuardNumber : otsTarget.targetVessel.stateRegulationNumber;
                const tripVesselId = this.trip.activeTrip.vessel.coastGuardNumber ? this.trip.activeTrip.vessel.coastGuardNumber : this.trip.activeTrip.vessel.stateRegulationNumber;
                if (otsTarget.targetType === 'Vessel' && otsTarget.fishery === this.trip.activeTrip.fishery.name && otsVesselId === tripVesselId) {
                    activeOTSTarget = otsTarget;
                }
            }
        }


        const randomNum = Math.floor(Math.random() * 100);

        if (activeOTSTarget && activeOTSTarget.setRate && this.trip.activeTrip) {
            if (randomNum < activeOTSTarget.setRate) {
                    this.trip.activeTrip.isSelected = true;
                    this.trip.activeTrip.notes =
                    'Trip selected using Target Type: ' +
                    activeOTSTarget.targetType +
                    ', with set rate of '
                    + activeOTSTarget.setRate +
                    ' (randomly generated number: '
                    + randomNum +
                    ' was less than set rate: '
                    + activeOTSTarget.setRate +
                    ')';
            } else {
                this.trip.activeTrip.isSelected = false;
                this.trip.activeTrip.notes = '';
            }
        }

        pouchService.db.post(pouchService.userDBName, this.trip.activeTrip);
        this.$router.push({path: '/trips/'});
    }

    private goToTrips() {
        this.$router.push({path: '/trips/'});
    }

    // private getTimeText(time: any) {
    //     const difference = moment.duration(moment().diff(moment(time))).asSeconds();
    //     if (difference < 15) {
    //         return 'just now';
    //     } else if (difference >= 15 && difference < 60 ) {
    //         return Math.floor(difference) + ' seconds ago';
    //     } else {
    //         return Math.floor(difference / 60) + ' minutes ago';
    //     }
    // }

    get departureDate(): string | undefined {
        if (this.trip.activeTrip) {
            return moment(this.trip.activeTrip.departureDate).format('YYYY/MM/DD');
        }
    }

    set departureDate(value) {
        if (this.trip.activeTrip) {
            this.trip.activeTrip.departureDate = value;
        }
    }

    get returnDate(): string | undefined {
        if (this.trip.activeTrip) {
            return moment(this.trip.activeTrip.returnDate).format('YYYY/MM/DD');
        }
    }

    set returnDate(value) {
        if (this.trip.activeTrip) {
            this.trip.activeTrip.returnDate = value;
        }
    }

    private returnDateOptionsFn(val: string) {
      if (this.trip.activeTrip && this.trip.activeTrip.departureDate) {
          return moment(val) >= moment(this.trip.activeTrip.departureDate);
      }
    }

    private updateTrip() {
        this.trip.activeTrip!.updatedBy = authService.getCurrentUser()!.username;
        this.trip.activeTrip!.updatedDate = moment().format();
        pouchService.db.put(pouchService.userDBName, this.trip.activeTrip);
        this.$router.push({path: '/trips'});
    }

    private async getOtsTargets() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
        const otsTargets = await masterDB.viewWithDocs<any>(
            'sethtest',
            'all_ots_targets',
            );
        console.log(otsTargets);
        for (const row of otsTargets.rows) {
            const target = row.doc;
            this.otsTargets.push(target);
        }

    } catch (err) {
        this.errorAlert(err);
    }
}


    private created() {
        console.log(this.permit.permits);
        this.getOtsTargets();
    }

}

</script>

<style lang="stylus" scoped>
.my-card
    width 95%

</style>

<!--
<script>
import Vue from 'vue';
export default {
    data() {
        return {
            trip: this.$store.state.activeTrip,
            permits: ['one', 'two', 'three','four', 'five', 'six','seven'],
            prompt: false,
            newMessage: ''
        }
    },
    methods: {
        addMessage() {
            this.trip.messages.push({author: this.$store.state.activeUser.name ,datetime: Date.now() ,text: this.newMessage});
            this.newMessage = '';
            this.prompt = false;
        }
    },
    computed: {
        tripMessages() {
                return this.trip.messages.reverse()
        }
    }
}
</script>
-->

<style scoped>
    p { margin-bottom: 5px; }
    .q-field { padding-bottom: 5px; }
</style>


