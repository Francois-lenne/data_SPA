import json
import pandas as pd
import requests 
import time
import asyncio


def get_extract_parameter():
    """
    Extract the API parameters (number of pages and number of animals) from the API response.

    :return: the number of pages and the number of animals
    """
    # URL de l'API
    url = "https://www.la-spa.fr/app/wp-json/spa/v1/animals/search/?api=1&seed=1"

    response = requests.get(url)  # do an api get request
    data = response.json()  # convert the response to json

    nbr_pages = data['nb_pages']  # obtain the number of pages
    nbr_animals = data['total']  # obtain the number of animals

    print(f"The number of pages to parse is {nbr_pages} and the number of animals is {nbr_animals}")

    return nbr_pages, nbr_animals


async def extract_data():
    """
    Extract the data from the API and store it in a pandas DataFrame.

    :return: pandas DataFrame containing the data
    """
    # Get the number of pages and animals
    nbr_pages, nbr_animals = get_extract_parameter()

    # List to store DataFrames from each page
    dataframes = []

    for i in range(1, nbr_pages + 1):
        url = f"https://www.la-spa.fr/app/wp-json/spa/v1/animals/search/?api=1&seed=1&page={i}"
        response = requests.get(url)
        data = response.json()
        df_animals = pd.DataFrame(data['results'])

        await asyncio.sleep(1)  # Pause to avoid overloading the API

        # Add the DataFrame to the list
        dataframes.append(df_animals)
        
        print(f"Page {i} has been processed")
    
    # Concatenate all DataFrames at once (more efficient)
    df_global = pd.concat(dataframes, ignore_index=True)
    
    if df_global.empty:
        raise ValueError("The DataFrame is empty. Check the API response.")

    return df_global


def check_data(df):
    """
    Check the dataframe by its volume and content.

    :param df: pandas DataFrame to check
    :return: None
    """
    # Get expected number of animals (reuse the API call result)
    _, nbr_animals = get_extract_parameter()

    # Check for duplicate IDs (most important check for this type of data)
    if 'ID' in df.columns:
        if df['ID'].duplicated().any():
            raise AssertionError("The DataFrame contains duplicate IDs.")
        print(f"No duplicate IDs found in {len(df)} records.")
    else:
        print("Warning: No 'ID' column found to check for duplicates.")
        
    # Check for completely identical rows by converting to string representation
    # This works with complex data types like dicts
    try:
        df_str = df.astype(str)
        if df_str.duplicated().any():
            print("Warning: Found duplicate rows when converted to string representation.")
        else:
            print("No duplicate rows found.")
    except Exception as e:
        print(f"Could not check for row duplicates due to complex data types: {e}")
    
    # Check for missing values in key columns
    null_counts = df.isnull().sum()
    if null_counts.any():
        print("Columns with null values:")
        for col, count in null_counts[null_counts > 0].items():
            print(f"  {col}: {count} null values")
    else:
        print("No null values found.")
    
    # Check if the total number matches expected
    if len(df) != nbr_animals:
        raise AssertionError(f"The total number of animals is {len(df)} but expected {nbr_animals}.")
    
    print(f"Data validation successful: {len(df)} animals loaded.")
    print("DataFrame structure:")
    print(f"  Shape: {df.shape}")
    print(f"  Columns: {list(df.columns)}")
    
    # Show data types
    print("\nColumn data types:")
    for col, dtype in df.dtypes.items():
        print(f"  {col}: {dtype}")


async def main():
    """
    Main function to orchestrate the data extraction and validation.
    """
    print("Starting data extraction...")
    
    df = await extract_data()
    
    print("Validating data...")
    check_data(df)
    
    print("Process completed successfully!")
    return df


if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())