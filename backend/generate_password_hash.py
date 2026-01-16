from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
password = 'password123'
hashed_password = pwd_context.hash(password)
print(f'New password hash: {hashed_password}')
