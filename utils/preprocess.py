import os
import cv2
import numpy as np
import json

folder_path = './assets/images/times_raw'
paths = os.listdir(folder_path)

for path in paths:
    img = 255 - (np.array(cv2.imread(folder_path + '/' + path, cv2.IMREAD_GRAYSCALE)))
    img = cv2.resize(img, (24,24), interpolation=cv2.INTER_NEAREST)
    cv2.imwrite(f'./assets/images/times_processed/{path}', img)
    print(f"{path}.png salvo em assets/images/times_processed")