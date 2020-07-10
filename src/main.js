import Vue from 'vue';
import App from './App.vue';
import './style/common.scss'; //引入 公共样式

Vue.config.productionTip = false;

new Vue({
	render: h => h(App),
}).$mount('#app');
