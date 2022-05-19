// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  apiUrl:'http://15.206.203.67:3000/',
  chainId:'0e64d141d9b3984271eaf55eda643d3a5a3f05e12ad6ab48837c54bdadbd1dfe',
  host: '65.0.0.45',
  port: '8888',
  protocol: 'http://',
  greymass: 'http://65.0.0.45:8888/v1/chain/get_currency_balances',
  eosflare: 'http://65.0.0.45:8888/v1/eosflare/get_account',
  production: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
