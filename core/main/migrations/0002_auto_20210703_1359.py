# Generated by Django 3.2.5 on 2021-07-03 11:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='category',
            name='date_creation',
        ),
        migrations.RemoveField(
            model_name='category',
            name='date_updated',
        ),
        migrations.RemoveField(
            model_name='category',
            name='user_creation',
        ),
        migrations.RemoveField(
            model_name='category',
            name='user_updated',
        ),
    ]
