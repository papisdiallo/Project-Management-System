# Generated by Django 4.0.2 on 2022-03-01 13:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_confirmationcode'),
    ]

    operations = [
        migrations.RenameField(
            model_name='confirmationcode',
            old_name='confirmation_code',
            new_name='code',
        ),
    ]
