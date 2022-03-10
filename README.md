# contract-checker

Basic [Etherscan API](https://etherscan.io/apis) implementation to monitor a smart contract's variable to detect changes.
- Monitor public sale status, whitelist sale status, price changes, etc
- Built using Web3 with [Infura](https://infura.io/) as provider
- Discord Webhook endpoint integration to create custom alerts when a change is detected.

## Floor Monitor

Using [OpenSea API](https://docs.opensea.io/reference/api-overview) create monitors for specific collections tracking floor price.
- Send a discord webhook when floor price reaches a target price (below or above).
- Limited by OpenSea API rate limits without a key.
