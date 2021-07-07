from django.contrib import admin
from django.urls import path

from core.main.views.category.views import *
from core.main.views.dashboard.views import DashboardView, asdView

app_name = 'main'
urlpatterns = [
    # Category
    path('category/', CategoryView.as_view(), name='category_list'),
    # path('category/add/', CategoryCreateView.as_view(), name='category_create'),
    # path('category/update/<int:pk>/', CategoryUpdateView.as_view(), name='category_update'),
    # path('category/delete/<int:pk>/', CategoryDeleteView.as_view(), name='category_delete'),
    # path('category/form/', CategoryFormView.as_view(), name='category_form'),
]
