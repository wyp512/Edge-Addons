from PIL import Image



original_image = Image.open('./icons/Robot48.png')


resized_image = original_image.resize((16, 16))

resized_image.save('Robot16.png')
