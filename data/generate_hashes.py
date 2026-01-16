from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

passwords = {
    'admin@123': 'Admin',
    'finance@123': 'Finance Manager (Priya)',
    'manager@123': 'Engineering Manager (Rajesh)',
    'senior@123': 'Senior Developer (Amit)',
    'junior@123': 'Junior Developer (Neha)',
    'sales@123': 'Sales Executive (Vikram)',
    'hr@123': 'HR Specialist (Anjali)'
}

print("Password Hashes:\n")
for pwd, label in passwords.items():
    hash_val = pwd_context.hash(pwd)
    print(f"{label}:")
    print(f"  Password: {pwd}")
    print(f"  Hash: {hash_val}\n")
