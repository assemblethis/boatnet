import Vue from 'vue';
import BoatnetLogin from './components/BoatnetLogin.vue';

// NOTE: This component has Quasar requirements.
// The host app is responsible for importing the quasar widgets used in this module.

const Components: any = {
  BoatnetLogin
};

Object.keys(Components).forEach((name) => {
  Vue.component(name, Components[name]);
});

export * from './_services/auth.service';
export * from './_store/';
export * from './models/auth.model';
export default Components;
