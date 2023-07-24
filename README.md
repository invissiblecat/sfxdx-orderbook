## Description

  # Order API

  _/getOrders_ -  Возвращает массив заявок. Параметры опциональны. Без параметров вернет все ордера. С заданным tokenA\tokenB - все заявки где в паре есть tokenA и|или tokenB. С параметром user - все заявки от конкретного пользователя. Параметр active (по умолчанию false) задает выдачу только не закрытых заявок.
  
  _/getMatchingOrders_ - Возвращает массив идентификаторов заявок, для вызова метода matchOrders в смарт контракте.

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

* `Error: failed response` or `Error: missing response` on app startup - happens once in while. Probably RPC provider error specific for testnets.
  *Solution*: restart server while error no longer is present