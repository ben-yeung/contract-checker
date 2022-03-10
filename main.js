const request = require('request');
const fetch = require('node-fetch')
const secrets = require('./secrets.json');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(secrets.INFURA_PROVIDER));
var version = web3.version.api;

var contractName = "Bibiz";
var contractAddress = "0x06D16D05daEc5C792622cef8c631e9352bb32A78";
var etherscan = "https://etherscan.io/address/0x00abdb2fbbc763b6b4a8700e10550ad74dac4d43#writeProxyContract"
var methodVar = "saleActive";
const targetVal = true

var lastValue = undefined;
var counter = 0;

function target(input) {
    if (input != lastValue) {
        lastValue = input
        return input == targetVal;
    } 
    return false
}

ether_key = secrets.ETHER_API_KEY;
webhook = secrets.WEBHOOK;

async function getContractData() {
    const endpoint = "https://api.etherscan.io/api?module=contract&action=getabi&address=" + contractAddress + "&apikey=" + ether_key;
    request(endpoint, function (error, response, body) {

        try {
            var json = JSON.parse(body);
            if (json.message === "NOTOK") {
                console.log("ERROR: " + json.result);
                return;
            }
            contractAbiJSON = JSON.parse(json.result);

            var contract = new web3.eth.Contract(contractAbiJSON, contractAddress);
    
            contract.methods[methodVar]().call().then((data) => {
    
                console.log("(" + counter + ") " + "Checking data: " + data)
                counter += 1
    
                if (target(data)) {
                    formattedData = "**Original:**: " + lastValue + "\n**New Value:** " + data + "\n" +  etherscan;
    
                    embed = {
                        "title":"**" + contractName + "** " + methodVar + " Change Detected",
                        "color":240116,
                        "description":formattedData
                    }
        
                    fetch(webhook, {
                        "method":"POST",
                        "headers": {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "username":"Contract Monitor",
                            "embeds":[embed],
                            "avatar_url":"https://etherscan.io/images/brandassets/etherscan-logo-circle.jpg"
                        })
                    })
                }
    
            })
    
        } catch (error) {
            console.log(error);
            return;
        }
        
    })
}
// getContractData()
setInterval(() => getContractData(), 1500);