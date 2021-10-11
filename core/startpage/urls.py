from django.urls import path

from core.startpage.views import CartListView

app_name = 'startpage'
urlpatterns = [
    path('cart/', CartListView.as_view(), name='cart_list'),
]
