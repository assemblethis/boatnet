<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Templates</div>
      </q-card-section>
      <q-card-section>
        <q-table
          :data="templateData"
          :columns="columns"
          selection="single"
          :selected.sync="selected"
        ></q-table>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="close" v-close-popup/>
        <q-btn
          flat
          label="Load Template"
          @click="loadTemplate"
          :disabled="selected.length === 0"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { TallyHistory, TallyLayoutRecord } from '../../_store/types';
import moment from 'moment';

export default Vue.component('tally-template-dialog', {
  props: {
    templateData: {
      // this seems complicated, not sure if there's a simpler way
      // https://frontendsociety.com/using-a-typescript-interfaces-and-types-as-a-prop-type-in-vuejs-508ab3f83480
      type: Array as () => TallyLayoutRecord[]
    }
  },
  data() {
    return {
      isOpen: false,
      selected: [] as any[],
      columns: [
        {
          name: 'value',
          label: 'Template Name',
          field: 'value',
          align: 'left'
        }
      ]
    };
  },
  methods: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.$emit('cancel');
      this.isOpen = false;
    },
    loadTemplate() {
      if (this.selected[0]) {
        const doc = this.selected[0].doc as TallyLayoutRecord;
        this.$emit('selectedDefaultTemplate', doc);
      }
    }
  },
  computed: {
    // history(): TallyHistory[] {
    //   return this.$store.getters['tallyState/currentTallyHistory'];
    // }
  }
});
</script>
