import json
import pandas as pd
import requests 

# URL de l'API
url = "https://www.la-spa.fr/app/wp-json/spa/v1/animals/search/?api=1&seed=1"





# Faire une requête GET à l'API
response = requests.get(url)

# Convertir la réponse en JSON
data = response.json()


nbr_pages = data['nb_pages']


nbr_annimals = data['total']



print(f"Le nombre de page à parser est de {nbr_pages}")


print(f"Le nombre total d'animal est de {nbr_annimals}")





# DataFrame global pour stocker tous les résultats
df_global = pd.DataFrame()

for i in range(1, nbr_pages+1):
    url = f"https://www.la-spa.fr/app/wp-json/spa/v1/animals/search/?api=1&seed=1&page={i}"
    response = requests.get(url)
    data = response.json()
    df_animals = pd.DataFrame(data['results'])
    
    # Ajouter les résultats au DataFrame global
    df_global = df_global._append(df_animals, ignore_index=True)
    
    print(df_animals)
    print(f"La page {i} a été traitée")

# Afficher le DataFrame global en dehors de la boucle
print(df_global)



df_global.to_csv("animals2.csv", index=False)