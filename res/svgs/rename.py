import os
i = 0
pre = 'img'
ext = 'svg'
for file in os.listdir("."):
    if not file == 'rename.py':
        name = "{}{}.{}".format(pre, i, ext)
        print("{} -> {}".format(file, name))
        os.rename(file, name)
        i += 1
