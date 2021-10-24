from django.urls import path

from core.user.views import *

app_name = 'user'

urlpatterns = [
    # User
    # path('list/', UserView.as_view(), name='user_list'),
    path('list/', UserListView.as_view(), name='user_list'),
    path('add/', UserCreateView.as_view(), name='user_create'),
    path('update/<int:pk>/', UserUpdateView.as_view(), name='user_update'),
]
