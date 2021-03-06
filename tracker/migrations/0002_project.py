# Generated by Django 4.0.2 on 2022-03-04 10:48

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tracker', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project_name', models.CharField(max_length=150)),
                ('avatar', models.ImageField(blank=True, null=True, upload_to='project_avatar')),
                ('project_type', models.CharField(choices=[('Software Development', 'Software Development'), ('Task Management', 'Task Management'), ('Business Management', 'Business Management')], max_length=25)),
                ('slug', models.SlugField(blank=True, max_length=30)),
                ('key', models.CharField(max_length=9, unique=True)),
                ('project_description', models.TextField(blank=True, null=True)),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('date_updated', models.DateTimeField(auto_now=True)),
                ('members', models.ManyToManyField(related_name='projects', to=settings.AUTH_USER_MODEL)),
                ('project_manager', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='project_manager', to=settings.AUTH_USER_MODEL)),
                ('project_site', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='projects', to='tracker.site')),
            ],
        ),
    ]
