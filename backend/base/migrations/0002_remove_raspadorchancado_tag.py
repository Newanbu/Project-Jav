# Generated by Django 5.1.7 on 2025-03-12 21:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='raspadorchancado',
            name='tag',
        ),
    ]
