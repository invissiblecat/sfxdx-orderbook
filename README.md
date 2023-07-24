## Description

  # Order API
```
  */getOrders*
  
  */getMatchingOrders*

```

## Installation

```bash
$ npm i
```

Fill the `.env` file `.evm.example`-like:

```
CONTRACT_ADDRESS='0x'

INFURA_URL='https://goerli.infura.io/v3'
API_KEY=''

```

## Running the app

```bash
$ npm start
```

## Troubleshooting

* `Error: failed response` or `Error: missing response` on app startup -- happens once in while. Probably RPC provider error specific for testnets.
  *Solution* -- restart server while error no longer is present