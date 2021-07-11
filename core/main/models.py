from crum import get_current_user
from django.db import models
from django.forms import model_to_dict
from datetime import datetime
from conf.settings import MEDIA_URL, STATIC_URL
from core.models import BaseModel


class Category(BaseModel):
    # Category Model
    name = models.CharField(max_length=50, verbose_name='Name', unique=True)
    desc = models.CharField(max_length=500, null=True, blank=True, verbose_name='Description')

    def __str__(self):
        return self.name

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        user = get_current_user()
        if user is not None:
            if not self.pk:
                self.user_creation = user
            else:
                self.user_updated = user
        super(Category, self).save()

    def toJSON(self):
        item = model_to_dict(self)
        return item

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']


class Product(models.Model):
    """ Product Model"""
    name = models.CharField(max_length=50, verbose_name='Name', unique=True)
    cat = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Category')
    image = models.ImageField(upload_to='product/%Y/%m/%d', null=True, blank=True, verbose_name='Image')
    stock = models.IntegerField(default=0, verbose_name='Stock')
    s_price = models.DecimalField(default=0.01, max_digits=9, decimal_places=2, verbose_name='Selling price')

    def __str__(self):
        return self.name

    def toJSON(self):
        item = model_to_dict(self)
        item['full_name'] = '{} / {}'.format(self.name, self.cat.name)
        item['cat'] = self.cat.toJSON()
        item['image'] = self.get_image()
        item['s_price'] = format(float(self.s_price), '.2f')
        return item

    def get_image(self):
        if self.image:
            return '{}{}'.format(MEDIA_URL, self.image)
        return '{}{}'.format(STATIC_URL, 'img/empty.png')

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['name']
