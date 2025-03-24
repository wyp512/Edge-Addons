from PIL import Image



original_image = Image.open('#')


resized_image = original_image.resize((16, 16))

resized_image.save('#')
