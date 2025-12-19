import os
import cv2
import numpy as np
import json

folder_path = './assets/images'
char_paths = os.listdir(folder_path)

for char_path in char_paths:
    char = np.array(cv2.imread(folder_path + '/' + char_path, cv2.IMREAD_GRAYSCALE))//255
    bitlines = [''.join(map(str, row)) for row in char]

    json_data = {
        "bitlines": bitlines
    }

    with open(f'./assets/bitfiles/{char_path.split('.')[0]}.json', 'w') as f:
        json.dump(json_data, f, indent=2)

    print(f"{char_path}.json salvo em assets/bitfiles")
    print(json.dumps(json_data, indent=2))