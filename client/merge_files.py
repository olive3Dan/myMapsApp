import os

# Specify the folder containing the files and the output file name
folder_path = r'C:\Users\Lenovo\OneDrive - Universidade Aberta\UAB\3 ANO\2 SEMESTRE\PROJETO DE ENGENHARIA INFORMÁTICA\PEI\client'
output_file = os.path.join(folder_path, 'output.txt')

# List of files to be processed
files = [
    'databaseUtils.js', 'formUtils.js', 'index.html', 'main.js', 'menus.js',
    'projects.js', 'styles.js', 'users.js', 'EventBus.js', 'features.js',
    'layers.js', 'mapTools.js', 'properties.js', 'style.css', 'temp.js'
]

with open(output_file, 'w', encoding='utf-8') as outfile:
    for filename in files:
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            with open(file_path, 'r', encoding='utf-8') as infile:
                outfile.write(f'==> {filename} <==\n')
                outfile.write(infile.read())
                outfile.write('\n\n')
        else:
            print(f"File {filename} not found in {folder_path}")

print(f"All files have been merged into {output_file}")