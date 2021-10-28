from crum import get_current_request
from django import forms
from django.contrib.auth.models import Group
from django.forms import ModelForm

from core.user.models import User, UserProfile


class UserForm(ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['first_name'].widget.attrs['autofocus'] = True

    class Meta:
        model = User
        fields = 'first_name', 'last_name', 'email', 'image', 'groups', 'phone_number', 'username', 'password',
        widgets = {
            'first_name': forms.TextInput(attrs={
                'placeholder': 'Enter your name',
            }),
            'last_name': forms.TextInput(attrs={
                'placeholder': 'Enter your last name',
            }),
            'email': forms.EmailInput(attrs={
                'placeholder': 'Enter you email Ex: user.12@mail.com',
            }),
            'phone_number': forms.TextInput(attrs={
                'placeholder': 'Example (+19999999999)'
            }),
            'groups': forms.SelectMultiple(attrs={
                'class': 'form-control select2',
                'style': 'width: 100%',
                'multiple': 'multiple',
            }),
            'username': forms.TextInput(attrs={
                'placeholder': 'Enter your username',
            }),
            'password': forms.PasswordInput(
                render_value=True,
                attrs={
                    'placeholder': 'Enter you password',
                }),
        }
        exclude = ['user_permissions', 'last_login', 'date_joined', 'is_superuser', 'is_staff', 'is_active']

    # def save(self, commit=True):
    #     """Sobreescribir el method save del Form para que
    #            utilice el encriptado de contraseña de Django
    #            """
    #     data = {}
    #     form = super()
    #     try:
    #         if form.is_valid():
    #             passw = self.changed_data['password']
    #             u = form.save(commit=False)  # hacer una pausa temporal y guardarlo en una variable
    #             if u.pk is None:
    #                 u.set_password(passw)
    #             else:
    #                 user = User.objects.get(pk=u.pk)
    #                 if user.password != passw:
    #                     u.set_password(passw)
    #             u.save()
    #             u.groups.clear()
    #             for g in self.cleaned_data['groups']:
    #                 u.groups.add(g)
    #         else:
    #             data['error'] = form.errors
    #     except Exception as e:
    #         data['error'] = str(e)
    #     return data

    def save(self, commit=True):
        data = {}
        form = super()
        request = get_current_request()
        try:
            if form.is_valid():
                passw = self.cleaned_data['password']
                # passw = request.POST['password']
                u = form.save(commit=False)
                if u.pk is None:
                    u.set_password(passw)
                else:
                    user = User.objects.get(pk=u.pk)
                    if user.password != passw:
                        u.set_password(passw)
                u.save()
                u.groups.clear()
                if request.POST.get('groups') is not None:
                    for g in self.cleaned_data['groups']:
                        u.groups.add(g)
                data = u
            else:
                data['error'] = form.errors
        except Exception as e:
            data['error'] = str(e)
        return data


class ProfileForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    class Meta:
        model = UserProfile
        fields = 'picture', 'skill', 'biography'
        widgets = {
            'skill': forms.TextInput(attrs={
                'placeholder': 'Enter your job title'
            }),
            'biography': forms.Textarea(attrs={
                'placeholder': 'Enter a short descriptions about yourself',
                'cols': 3,
                'rows': 3,
            })
        }


# class UserProfileForm(ModelForm):
#
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self.fields['first_name'].widget.attrs['autofocus'] = True
#
#     class Meta:
#         model = User
#         fields = 'first_name', 'last_name', 'email', 'username', 'password', 'image'
#         widgets = {
#             'first_name': forms.TextInput(
#                 attrs={
#                     'placeholder': 'Enter your names',
#                 }
#             ),
#             'last_name': forms.TextInput(
#                 attrs={
#                     'placeholder': 'Enter your last_names',
#                 }
#             ),
#             'email': forms.TextInput(
#                 attrs={
#                     'placeholder': 'Enter you email',
#                 }
#             ),
#             'username': forms.TextInput(
#                 attrs={
#                     'placeholder': 'Enter your username',
#                 }
#             ),
#             'password': forms.PasswordInput(
#                 render_value=True,
#                 attrs={
#                     'placeholder': 'Enter you password',
#                 }
#             ),
#         }
#         exclude = ['user_permissions', 'last_login', 'date_joined', 'is_superuser', 'is_staff', 'is_active', 'groups']
#
#     def save(self, commit=True):
#         """Sobreescribir el method save del Form para que
#         utilice el encriptado de contraseña de Django
#         """
#         data = {}
#         form = super()
#         try:
#             if form.is_valid():
#                 pwd = self.cleaned_data['password']
#                 u = form.save(commit=False)  # hacer una pausa temporal y guardarlo en una variable
#                 if u.pk is None:
#                     u.set_password(pwd)
#                 else:
#                     user = User.objects.get(pk=u.pk)
#                     if user.password != pwd:
#                         u.set_password(pwd)
#                 u.save()
#             else:
#                 data['error'] = form.errors
#         except Exception as e:
#             data['error'] = str(e)
#         return data
