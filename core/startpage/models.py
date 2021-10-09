from datetime import datetime

from django.db import models
from django.forms import model_to_dict

from core.main.models import Product


class Cart(models.Model):
    date_joined = models.DateField(default=datetime.now)
    total = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)
    cli_name = models.CharField(max_length=50, verbose_name='Name', unique=False)
    cli_addr = models.CharField(max_length=150, verbose_name='Address', null=True, blank=True, )
    cli_note = models.CharField(max_length=300, verbose_name='Nota', null=True, blank=True, )

    def __str__(self):
        return self.cli_name

    class Meta:
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
        ordering = ['id']


class DetCart(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    cant = models.IntegerField(default=0)
    subtotal = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)
    price = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)

    def __str__(self):
        return self.product.name

    class Meta:
        verbose_name = 'Cart detail'
        verbose_name_plural = 'Cart details'
        ordering = ['id']

    def toJSON(self):
        item = model_to_dict(self, exclude=['cart'])
        item['product'] = self.product.toJSON()
        item['price'] = format(float(self.price), '.2f')
        item['subtotal'] = format(float(self.subtotal), '.2f')
        return item
