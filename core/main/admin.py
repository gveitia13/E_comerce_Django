from django.contrib import admin

# Register your models here.
from core.main.models import Category, Product, Task

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Task)
