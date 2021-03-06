# Generated by Django 4.0.2 on 2022-03-07 11:40

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tracker', '0003_rename_project_name_project_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='members',
            field=models.ManyToManyField(related_name='projects', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='project',
            name='project_theme',
            field=models.CharField(blank=True, default='#ffffff #ffffff', max_length=150, null=True),
        ),
    ]
