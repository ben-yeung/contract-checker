const request = require('request');
const fetch = require('node-fetch')
const secrets = require('./secrets.json'); // Needs Infura endpoint, Etherscan API Key, and Webhook
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(secrets.INFURA_PROVIDER));
var version = web3.version.api;

var contractName = "Avius Animae"
var contractAddress = "0x0eDA3c383F13C36db1c96bD9c56f715B09b9E350";
var etherscan = "https://etherscan.io/address/" + contractAddress + "#writeProxyContract"
var methodVar = "totalSupply";
const targetVal = 5000

var lastValue = undefined;
var counter = 0;

function target(input) {
    if (input != lastValue) {
        lastValue = input
        return input >= targetVal;
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
setInterval(() => getContractData(), 5000);