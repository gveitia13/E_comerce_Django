# Generated by Django 3.2.5 on 2021-07-17 02:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_alter_sale_options'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='DetSate',
            new_name='DetSale',
        ),
        migrations.AlterField(
            model_name='sale',
            name='iva',
            field=models.DecimalField(decimal_places=2, default=0.01, max_digits=9),
        ),
    ]
