import bcrypt

hashed = b"$2b$10$JcmUQDJ4/iGXJxQo2JzQP.uQJIjG7UXBKB6/LEGRCuQJ.d8/WJj92"
password = b"password123"

if bcrypt.checkpw(password, hashed):
    print("Match!")
else:
    print("No match.")