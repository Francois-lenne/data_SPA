import pandas as pd
import json

# Charger le fichier JSON
with open('animal_data_265.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Convertir les données JSON en DataFrame pandas
df = pd.DataFrame(data)

# Afficher le DataFrame
print(df)



# Obtenir les valeurs distinctes de la colonne 'sos'
distinct_sos = df['race'].unique()


# Afficher les valeurs distinctes
print(distinct_sos)