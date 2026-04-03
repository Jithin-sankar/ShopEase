import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from django.contrib.auth.models import User

username = 'admin'
password = 'jithin'
email = 'admin@example.com'

user, created = User.objects.get_or_create(username=username, defaults={'email': email})
user.set_password(password)
user.is_staff = True
user.is_superuser = True
user.save()

if created:
    print(f"CREATED: User {username} is now in the Render database.")
else:
    print(f"UPDATED: Password for {username} has been reset in the Render database.")