from django.urls import path

from core.startpage import views
from core.startpage.views import CartListView

app_name = 'startpage'
urlpatterns = [
    path('cart/', CartListView.as_view(), name='cart_list'),
    path('cart/invoice/pdf/<int:pk>/', views.export_pdf, name='export-pdf'),
]
