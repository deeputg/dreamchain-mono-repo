// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  apiUrl:'http://13.127.19.27:3000/',
  chainId:'0e64d141d9b3984271eaf55eda643d3a5a3f05e12ad6ab48837c54bdadbd1dfe',
  host: '15.206.79.84',
  port: '8888',
  protocol: 'http://',
  greymass: 'http://15.206.79.84:8888/v1/chain/get_currency_balances',
  eosflare: 'http://15.206.79.84:8888/v1/eosflare/get_account',
  production: false
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
