import requests

API_URL = "https://www.la-spa.fr/app/wp-json/spa/v1/establishments/"
PARAMS = {
    "api": "1",
    "types": "maisons-spa,refuges",
    "lat": "",
    "lng": ""
}

def fetch_refuges_data():
    response = requests.get(API_URL, params=PARAMS)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    data = fetch_refuges_data()
    print(data)