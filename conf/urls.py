"""conf URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from core.main.views.dashboard.views import DashboardView
from core.startpage.views import StartPageView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('main/', include('core.main.urls')),
    path('user/', include('core.user.urls')),
    path('login/', include('core.login.urls')),
    path('startpage/', include('core.startpage.urls')),
    # Dashboard
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('', StartPageView.as_view(), name='startpage'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
