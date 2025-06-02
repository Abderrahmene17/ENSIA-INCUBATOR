from django.db import migrations

def create_roles(apps, schema_editor):
    Role = apps.get_model('incubator_backend', 'Role')
    roles = ['admin', 'coach', 'mentor', 'trainer', 'student']
    for role in roles:
        Role.objects.get_or_create(name=role)

def remove_roles(apps, schema_editor):
    Role = apps.get_model('incubator_backend', 'Role')
    Role.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('incubator_backend', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_roles, remove_roles),
    ] 