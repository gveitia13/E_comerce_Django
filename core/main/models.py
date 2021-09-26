from time import strptime

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
    # icon_class = models.CharField(verbose_name='icon', blank=True, null=True, default='mdi mdi-star')

    def __str__(self):
        return self.name

    # def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
    #     user = get_current_user()
    #     if user is not None:
    #         if not self.pk:
    #             self.user_creation = user
    #         else:
    #             self.user_updated = user
    #     super(Category, self).save()

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
    image = models.ImageField(upload_to='product/%Y/%m/%d', null=True, blank=True)
    stock = models.IntegerField(default=1, verbose_name='Stock')
    s_price = models.DecimalField(default=0.01, max_digits=9, decimal_places=2, verbose_name='Selling price')

    def __str__(self):
        return self.name

    def toJSON(self):
        item = model_to_dict(self)
        item['full_name'] = '{} / {}'.format(self.name, self.cat.name)
        item['cat'] = self.cat.toJSON()
        item['image'] = self.get_image()
        item['s_price'] = format(float(self.s_price), '.2f')
        item['subtotal'] = 0.00
        return item

    def get_image(self):
        if self.image:
            return '{}{}'.format(MEDIA_URL, self.image)
        return '{}{}'.format(STATIC_URL, 'img/empty.png')

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['name']


gender_choices = (
    ('male', 'Male'),
    ('female', 'Female'),
    ('todo', 'Todo lol'),
)


class Client(models.Model):
    name = models.CharField(max_length=50, verbose_name='Names')
    surnames = models.CharField(max_length=80, verbose_name='Surnames')
    date_birthday = models.DateField(default=datetime.now, verbose_name='Date birthday')
    dni = models.CharField(max_length=11, unique=True, verbose_name='DNI')
    address = models.CharField(max_length=150, null=True, blank=True, verbose_name='Address')
    gender = models.CharField(max_length=50, choices=gender_choices, default='todo', verbose_name='Gender')
    email = models.EmailField(verbose_name='Email', unique=True, max_length=50)

    def __str__(self):
        return self.get_full_name()

    def get_full_name(self):
        return '{} {} / {}'.format(self.name, self.surnames, self.dni)

    def toJSON(self):
        item = model_to_dict(self)
        item['date_birthday'] = self.date_birthday.strftime('%Y-%m-%d')
        item['full_name'] = self.get_full_name()
        return item

    class Meta:
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
        ordering = ['name']


class Sale(models.Model):
    """ Sale Model """
    cli = models.ForeignKey(Client, on_delete=models.CASCADE)
    date_joined = models.DateField(default=datetime.now)
    subtotal = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)
    iva = models.DecimalField(default=0.01, max_digits=9, decimal_places=2)
    total = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)

    def __str__(self):
        return self.cli.name

    def toJSON(self):
        item = model_to_dict(self)
        item['cli'] = self.cli.toJSON()
        item['subtotal'] = format(float(self.subtotal), '.2f')
        item['iva'] = format(float(self.iva), '.2f')
        item['total'] = format(float(self.total), '.2f')
        item['date_joined'] = self.date_joined.strftime('%Y-%m-%d')
        item['det'] = [i.toJSON() for i in self.detsale_set.all()]
        return item

    def delete(self, using=None, keep_parents=False):
        for det in self.detsale_set.all():
            det.prod.stock += det.cant
            det.prod.save()
        super(Sale, self).delete()

    class Meta:
        verbose_name = 'Sale'
        verbose_name_plural = 'Sales'
        ordering = ['id']


class DetSale(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
    prod = models.ForeignKey(Product, on_delete=models.CASCADE)
    price = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)
    cant = models.IntegerField(default=0)
    subtotal = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)

    def __str__(self):
        return self.prod.name

    def toJSON(self):
        item = model_to_dict(self, exclude=['sale'])
        item['prod'] = self.prod.toJSON()
        item['price'] = format(float(self.price), '.2f')
        item['subtotal'] = format(float(self.subtotal), '.2f')
        return item

    class Meta:
        verbose_name = 'Sale\'s detail'
        verbose_name_plural = 'Sales\'s detail'
        ordering = ['id']
