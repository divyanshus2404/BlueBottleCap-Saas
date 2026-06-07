from PIL import Image

def crop_image(input_path, output_path, border_size):
    try:
        with Image.open(input_path) as img:
            width, height = img.size
            # Crop border_size from all sides (left, top, right, bottom)
            cropped_img = img.crop((border_size, border_size, width - border_size, height - border_size))
            cropped_img.save(output_path, quality=95)
            print(f"Cropped {border_size}px. Original size: {width}x{height}, New size: {cropped_img.size}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import sys
    # I will guess a border size of around 15 pixels based on standard thin borders on photos, but I should look at the image if possible.
    # To be safe, I'll crop 20 pixels from all sides to make sure the black outline is fully removed.
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    border = int(sys.argv[3])
    crop_image(input_file, output_file, border)
