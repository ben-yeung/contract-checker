import os
import json
import requests
import time

with open(os.path.join('secrets.json'), mode='r') as f:
    secrets = json.loads(f.read())

personal = secrets['WEBHOOK'] # Put custom webhook here

# slug string (collection name in link): [checkAbovePrice, price, webhook]
pages = { 
    "duck-frens":[True, 0.1, personal],
    "drp-shintaro":[True, 0.15, personal],
    "space-boo-official-nft":[True, 0.11, personal],
    "uwucrew":[True, 0.3, personal]
}
interval = 120

if __name__ == "__main__":

    while True:
        for key, val in pages.items():

            target_floor = val[1]

            try:
                url = "https://api.opensea.io/api/v1/collection/" + key
                headers = {"Accept": "application/json"}
                response = requests.request("GET", url, headers=headers)
                if (response.status_code == 200):
                    data = response.json()['collection']
                    stats = data['stats']
                    info = data['primary_asset_contracts'][0]
                    curr_floor = float(stats['floor_price'])
                    project_title = info['name']
                    img_src = info['image_url']
                    royalties = float(info['seller_fee_basis_points']) / 100
                    project_URL = "https://opensea.io/collection/" + key
                    etherscan = "https://etherscan.io/address/" + info['address']
                    supply = stats['total_supply']
                    owners = stats['num_owners']

                    print(f"Floor price for {key} is currently {curr_floor}Ξ. Target is {target_floor}Ξ")
                    
                    links = "[OpenSea]({}) • [EtherScan]({})".format(project_URL, etherscan)
                    
                    if (data['discord_url']):
                        links += " • [Discord]({})".format(data['discord_url'])

                    if (info['external_link']):
                        links += " • [Website]({})".format(info['external_link'])

                    if (data['twitter_username']):
                        links += " • [Twitter](https://twitter.com/{})".format(data['twitter_username'])

                    if val[0] and curr_floor > target_floor:
                        embed = {
                            "title":"{} reached {}Ξ Floor".format(project_title, curr_floor),
                            "description":"**Target:** Above {}Ξ\n\n".format(target_floor) + links,
                            "thumbnail": {
                                "url":img_src
                            },
                            "footer": {
                                "text": "Royalties: {}% | Owners: {} | Total Supply: {}".format(royalties, int(owners), int(supply))
                            },
                            "color":44774
                        }
                        data = {
                            "username":"Floor Monitor",
                            "embeds":[embed],
                            "avatar_url":"https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"
                        }
                        url = val[2]
                        res = requests.post(url, json=data)

                    elif not val[0] and curr_floor < target_floor:
                        embed = {
                            "title":"{} reached {}Ξ Floor".format(project_title, curr_floor),
                            "description":"**Target:** Below {}Ξ\n\n".format(target_floor) + links,
                            "thumbnail": {
                                "url":img_src
                            },
                            "footer": {
                                "text": "Royalties: {}% | Owners: {} | Total Supply: {}".format(royalties, int(owners), int(supply))
                            },
                            "color":44774
                        }
                        data = {
                            "username":"Floor Monitor",
                            "embeds":[embed],
                            "avatar_url":"https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"
                        }
                        url = val[2]
                        res = requests.post(url, json=data)

                    if not val[0]:
                        pages[key][1] = min(curr_floor, target_floor)
                    else:
                        pages[key][1] = max(curr_floor, target_floor)

                else:
                    print("ERROR calling API (Rate limit)")
                    time.sleep(3)
                    continue
                
            except:
                print("ERROR monitoring floor price")

        time.sleep(interval)
