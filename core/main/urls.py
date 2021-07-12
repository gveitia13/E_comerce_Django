from django.urls import path

from core.main.views.category.views import *
from core.main.views.client.views import ClientView
from core.main.views.product.views import ProductView

app_name = 'main'
urlpatterns = [
    # Category
    path('category/', CategoryView.as_view(), name='category_list'),
    # Product
    path('product/', ProductView.as_view(), name='product_list'),
    # Client
    path('client/', ClientView.as_view(), name='client_list'),
]
