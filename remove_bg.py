import sys
import subprocess
import os

def install_and_run():
    print("Installing rembg...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "rembg", "Pillow", "onnxruntime"])
    
    import rembg
    from PIL import Image
    
    input_path = "assets/velvet_coffee_cup.png"
    output_path = "assets/velvet_coffee_cup_transparent.png"
    
    print("Removing background...")
    with open(input_path, 'rb') as i:
        with open(output_path, 'wb') as o:
            input_data = i.read()
            output_data = rembg.remove(input_data)
            o.write(output_data)
            
    print("Replacing original file...")
    os.replace(output_path, input_path)
    print("Done!")

if __name__ == "__main__":
    install_and_run()
