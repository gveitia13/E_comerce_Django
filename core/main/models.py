from crum import get_current_user
from django.db import models
from django.forms import model_to_dict

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
