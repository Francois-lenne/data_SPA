import requests
import pandas as pd
from datetime import datetime
import gcsfs
import os
from dotenv import load_dotenv

load_dotenv()

def fetch_refuges_data() -> pd.DataFrame:
    """

    Fetch data about refuges from the SPA API and return it as a pandas DataFrame.
    :return: pandas DataFrame containing the refuges data + metadata for the SCD
    """
    # Define the API endpoint and parameters
    API_URL = "https://www.la-spa.fr/app/wp-json/spa/v1/establishments/"
    PARAMS = {
        "api": "1",
        "types": "maisons-spa,refuges",
        "lat": "",
        "lng": ""
    }

    # Make the API request and handle potential errors
    response = requests.get(API_URL, params=PARAMS)
    response.raise_for_status()
    response_data = response.json()

    # Create DataFrame from the response data
    df = pd.DataFrame(response_data["items"], columns=["ID", "name", "address", "latitude", "longitude", "opening_hours"])

    # Add metadata columns
    df["load_timestamp"] = datetime.now().isoformat()


    # Save the DataFrame to a Parquet file in Google Cloud Storage
    fs = gcsfs.GCSFileSystem()
    GCP_BUCKET_NAME = os.environ.get("GCP_BUCKET_NAME")
    if not GCP_BUCKET_NAME:
        raise ValueError("Environment variable 'GCP_BUCKET_NAME' is not set.")
    df.to_parquet(
        f"gs://{GCP_BUCKET_NAME}/raw/refuges/refuges_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.parquet",
        engine="pyarrow"
    )

    return df




if __name__ == "__main__":
    data = fetch_refuges_data()
    print(data)