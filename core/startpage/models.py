from datetime import datetime

from django.db import models
from django.forms import model_to_dict

from conf import settings
from core.main.models import Product

status_choices = (
    ('Pending', 'Pending'),
    ('Shipped', 'Shipped'),
    ('Sold', 'Sold'),
)


class Cart(models.Model):
    user_updated = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                     related_name='cart_user_updated', null=True, blank=True)
    date_joined = models.DateField(auto_now_add=True, null=True, blank=True)
    total = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)
    cli_name = models.CharField(max_length=50, verbose_name='Name', unique=False)
    cli_addr = models.CharField(max_length=150, verbose_name='Address', null=True, blank=True, )
    cli_note = models.CharField(max_length=300, verbose_name='Nota', null=True, blank=True, )
    status = models.CharField(max_length=50, choices=status_choices, default='Pending', verbose_name='Status')

    def __str__(self):
        return f'No: {self.id} {self.cli_name}'

    class Meta:
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
        ordering = ['id']

    def toJSON(self):
        item = model_to_dict(self)
        item['total'] = format(float(self.total), '.2f')
        item['date_joined'] = self.date_joined.strftime('%Y-%m-%d')
        item['det'] = [i.toJSON() for i in self.detcart_set.all()]
        return item


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
