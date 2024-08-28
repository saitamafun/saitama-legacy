# Saitama Mono Repository

Welcome to saitama mono repository to get started get family with the following directory

-  `/apps`
- `/contracts`
- `servers`


## /apps

This directory contains the web and mobile app. This contain the famous `fubuki` which is the no-code we editor.

## /contracts 

This directory contains the smart contract for managing payments onchain.

### /Bofoi 

This is a solana program that help keep track of payment and receipt onchain to make it easier to trace transactions onchain and offchain. This also allows us to minimize transaction cost by bulking of transactions.


## /Servers 

This directory contains our api servers.

### /Blast 

This is a crud api for `fubuki`

### /Kamikaze

This is a crud api for `bofoi` and our payment saas

# Requirements 

To get the project to run you either run using docker or install bun on your local machine.

## Using docker 

> Note this is still under improvement `docker-compose.yml` support soon


## Using bun 

1. `cd` to project root directory
2. Run `bun install`
3. Run `bun run dev`

> ✨ Voila project is running