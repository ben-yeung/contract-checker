var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/b095ad0962044db693c1a9fb711b0e57"));
var version = web3.version.api;
const request = require('request');
const fetch = require('node-fetch')
const secrets = require('./secrets.json');

contractAddress = "0x86C10D10ECa1Fca9DAF87a279ABCcabe0063F247";
contractName = "Cool Pets";
variable = "_publicMintStatus";

counter = 0;

function target(input) {
    return input != 0;
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
    
            // contract.getPastEvents('allEvents', {
            //     fromBlock: 14173871,
            //     toBlock: 14173881
            // }, 
            // function(error, events) {
            //     console.log(events)
            // })
    
            contract.methods._publicMintStatus().call().then((data) => {
    
                console.log("(" + counter + ") " + "Checking data: " + data)
                counter += 1
    
                if (data != 0) {
                    formattedData = "**_publicMintStatus:** " + data;
    
                    embed = {
                        "title":"**Cool Pets** Variable Change Detected",
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