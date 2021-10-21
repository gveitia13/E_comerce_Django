from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Register your models here.
from core.user.models import User, UserProfile

# class CustomUserAdmin(UserAdmin):
#     list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff')
#     list_filter = ('is_staff', 'date_joined', 'last_login')
#
#
# @admin.register(UserProfile)
# class UserProfileAdmin(admin.ModelAdmin):
#     list_display = ('user', 'reputation', 'sales_made', 'carts_sent', 'products_added')
#     search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
#     list_filter = ('reputation',)


admin.site.register(User)
admin.site.register(UserProfile)
