from datetime import datetime

from django import forms
from django.forms import ModelForm, Select

from core.main.models import Category, Product, Client, Sale


class CategoryForm(ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['autofocus'] = True

    class Meta:
        model = Category
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(
                attrs={
                    'placeholder': 'Enter a name'
                }
            ),
            'desc': forms.Textarea(
                attrs={
                    'placeholder': 'Enter a short description',
                    'rows': 3,
                    'cols': '3'
                }
            ),
        }
        exclude = ['user_updated', 'user_creation']

    def save(self, commit=True):
        data = {}
        form = super()
        try:
            if form.is_valid():
                form.save()
            else:
                data['error'] = form.errors
        except Exception as e:
            data['error'] = str(e)
        return data

    def clean(self):
        cleaned = super().clean()
        if len(cleaned['name']) <= 10:
            raise forms.ValidationError('mi validation random')
            # self.add_error('name', 'Les faltan caracteres')
        return cleaned


class ProductForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['autofocus'] = True
        self.fields['s_price'].widget.attrs['min'] = "0.01"

    class Meta:
        model = Product
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(
                attrs={
                    'placeholder': 'Enter a name',
                }
            ),
            'cat': Select(
                attrs={
                    'class': 'select2',
                    'style': 'width: 100%'
                }
            ),
        }

    def save(self, commit=True):
        data = {}
        form = super()
        try:
            if form.is_valid():
                form.save()
            else:
                data['error'] = form.errors
        except Exception as e:
            data['error'] = str(e)
        return data


class ClientForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['autofocus'] = True

    class Meta:
        model = Client
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(
                attrs={
                    'placeholder': 'Enter you name',
                    'minlength': 2
                }
            ),
            'surnames': forms.TextInput(
                attrs={
                    'placeholder': 'Enter your surnames',
                    'minlength': 2
                }
            ),
            'dni': forms.TextInput(
                attrs={
                    'placeholder': 'Enter you DNI',
                    'minlength': 11
                }
            ),
            'date_birthday': forms.DateInput(
                format='%Y-%m-%d',
                attrs={
                    'value': datetime.now().strftime('%Y-%m-%d'),
                }
            ),
            'address': forms.TextInput(
                attrs={
                    'placeholder': 'Enter you address (optional)',
                }
            ),
            'gender': forms.Select(),
            'email': forms.EmailInput(
                attrs={
                    'placeholder': 'Enter you email ex: user@mail.com'
                }
            )
        }
        # exclude = ['user_updated', 'user_creation']

    def save(self, commit=True):
        data = {}
        form = super()
        try:
            if form.is_valid():
                instance = form.save()
                data = instance.toJSON()
            else:
                data['error'] = form.errors
        except Exception as e:
            data['error'] = str(e)
        return data


class SaleForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['cli'].queryset = Client.objects.none()

    class Meta:
        model = Sale
        fields = '__all__'
        widgets = {
            'cli': Select(attrs={
                'class': 'custom-select select2'
            }),
            'date_joined': forms.DateInput(
                format='%Y-%m-%d',
                attrs={
                    'value': datetime.now().strftime('%Y-%m-%d'),
                    'autocomplete': 'off',
                    'class': 'form-control',
                    'id': 'id_date_joined',
                }
            ),
            'iva': forms.TextInput(attrs={
                'class': 'form-control w3-center',
            }),
            'subtotal': forms.TextInput(attrs={
                'readonly': True,
                'class': 'form-control-plaintext w3-center',
                'disabled': True,
            }),
            'total': forms.TextInput(attrs={
                'readonly': True,
                'class': 'form-control-plaintext w3-center',
                'disabled': True,
            }),
        }
