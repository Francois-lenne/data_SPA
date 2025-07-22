import json
import pandas as pd
import requests 
import time
import asyncio



def get_extract_parameter():
    """
    extract the API parameters (number of pages and number of animals) from the API response.

    :return: the number of pages and the number of animals
    """

    # URL de l'API
    url = "https://www.la-spa.fr/app/wp-json/spa/v1/animals/search/?api=1&seed=1"

    response = requests.get(url) # do an api get request

    data = response.json() # convert the response to json

    nbr_pages = data['nb_pages'] # obtain the number of pages

    nbr_annimals = data['total'] # obtain the number of animals

    print(f"the number of pages to parse is {nbr_pages} and the number of animals is {nbr_annimals}") # print a control 

    return nbr_pages, nbr_annimals # return the number of pages and the number of animals




async def extract_data():
    """
    extract the data from the API and store it in a pandas DataFrame.

    :param nbr_pages: number of pages to parse
    :return: pandas DataFrame containing the data
    """

    # Appel de la fonction pour obtenir le nombre de pages et d'animaux
    nbr_pages, nbr_annimals = get_extract_parameter()


    # DataFrame global pour stocker tous les résultats
    df_global = pd.DataFrame()

    for i in range(1, nbr_pages+1):
        url = f"https://www.la-spa.fr/app/wp-json/spa/v1/animals/search/?api=1&seed=1&page={i}"
        response = requests.get(url)
        data = response.json()
        df_animals = pd.DataFrame(data['results'])

        aw

        # Ajouter les résultats au DataFrame global
        df_global = df_global._append(df_animals, ignore_index=True)
        

        print(f"La page {i} a été traitée")
    
    if df_global.empty:
        raise ValueError("Le DataFrame est vide. Vérifiez la réponse de l'API.")
    
    if df_global.isnull().values.any():
        raise ValueError("Le DataFrame contient des valeurs nulles. Vérifiez la réponse de l'API.")

    return df_global


def check_data(df):
    """
    Check the dataframe by is volume and by its content.

    :param df: pandas DataFrame to check
    :return: None
    """
    nbr_annimals = get_extract_parameter()

    # Check for duplicates
    if df.duplicated().any():
        raise ValueError("Le DataFrame contient des doublons.")
    
    # Check for missing values
    if df.isnull().values.any():
        raise ValueError("Le DataFrame contient des valeurs nulles.")
    
    if {len(df)} != {nbr_annimals}:
        raise AssertionError(f"Le nombre total d'animaux est {len(df)} et le nombre d'animaux attendu est {nbr_annimals}.")
    

    if not df['ID'].duplicated().any():
        raise AssertionError("Le DataFrame contient des doublons dans la colonne ID.")

    
    print("Le DataFrame ne contient pas de doublons ni de valeurs nulles.")



def main():
    get_extract_parameter()

    df = extract_data()

    check_data(df)


if __name__ == "__main__":
    main()