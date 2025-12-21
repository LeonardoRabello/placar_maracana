import os
import cv2
import numpy as np
import json

folder_path = './assets/displays_json'
json_files = os.listdir(folder_path)

# Criar pasta de saída se não existir
output_folder = './assets/displays'
os.makedirs(output_folder, exist_ok=True)

for json_file in json_files:
    if not json_file.endswith('.json'):
        continue

    # Ler o arquivo JSON
    with open(f'{folder_path}/{json_file}', 'r') as f:
        json_data = json.load(f)

    # Converter bitlines para array numpy
    bitlines = json_data['bitlines']
    char = np.array([[int(bit) for bit in row] for row in bitlines], dtype=np.uint8)

    # Multiplicar por 255 para obter valores de pixel (0 ou 255)
    char = char * 255

    # Salvar como imagem PNG
    output_path = f'{output_folder}/{json_file.split(".")[0]}.png'
    cv2.imwrite(output_path, char)

    print(f"{json_file} convertido para {output_path}")