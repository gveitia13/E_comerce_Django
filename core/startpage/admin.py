from django.contrib import admin

# Register your models here.
from core.startpage.models import Cart, DetCart

admin.site.register(Cart)
admin.site.register(DetCart)
