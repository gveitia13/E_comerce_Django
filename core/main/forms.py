from datetime import datetime
from urllib import request

from crum import get_current_request
from django import forms
from django.forms import ModelForm, Select

from core.main.models import Category, Product, Client, Sale, Task


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
                    'placeholder': 'Enter a name',
                    'class': 'circular',
                    'minlength': 3
                }
            ),
            'desc': forms.Textarea(
                attrs={
                    'placeholder': 'Enter a short description',
                    'rows': 3,
                    'cols': '3',
                    'class': 'circular',
                }
            ),
            'icon_class': forms.TextInput(
                attrs={
                    'placeholder': 'Example: mdi mdi-star',
                    'class': 'circular'
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
                    'class': 'circular',
                    'minlength': 3
                }
            ),
            'cat': Select(
                attrs={
                    'class': 'selectpicker',
                    'style': 'width: 100%',
                    'data-style': 'btn border-light circular-left',
                    'data-live-search': 'true'
                }
            ),
            'desc': forms.Textarea(
                attrs={
                    'placeholder': 'Enter a description (optional)',
                    'class': 'circular',
                    'rows': 3,
                    'cols': '3',
                }
            ),
            'priority': forms.Select(
                attrs={
                    'class': 'selectpicker',
                    'style': 'width: 100%',
                    'data-style': 'btn btn-default form-control circular',
                }
            ),
        }
        exclude = ['user_updated', 'user_creation']

    def save(self, commit=True):
        data = {}
        form = super()
        try:
            if form.is_valid():
                u = form.save(commit=False)
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
                    'minlength': 2,
                    'class': 'circular',
                }
            ),
            'surnames': forms.TextInput(
                attrs={
                    'placeholder': 'Enter your surnames',
                    'minlength': 2,
                    'class': 'circular',
                }
            ),
            'date_birthday': forms.DateInput(
                format='%Y-%m-%d',
                attrs={
                    'value': datetime.now().strftime('%Y-%m-%d'),
                    'class': 'circular',
                }
            ),
            'dni': forms.TextInput(
                attrs={
                    'placeholder': 'Enter you DNI',
                    'minlength': 11,
                    'class': 'circular',
                }
            ),
            'address': forms.TextInput(
                attrs={
                    'placeholder': 'Enter you address (optional)',
                    'class': 'circular',
                }
            ),
            'gender': forms.Select(
                attrs={
                    'class': 'selectpicker',
                    'style': 'width: 100%',
                    'data-style': 'btn btn-default form-control circular',
                }
            ),
            'email': forms.EmailInput(
                attrs={
                    'placeholder': 'Enter you email ex: user@mail.com',
                    'class': 'circular'
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
                'class': 'custom-select select2 circular-left'
            }),
            'date_joined': forms.DateInput(
                format='%Y-%m-%d',
                attrs={
                    'value': datetime.now().strftime('%Y-%m-%d'),
                    'autocomplete': 'off',
                    'class': 'form-control circular',
                    'id': 'id_date_joined',
                }
            ),
            'iva': forms.TextInput(attrs={
                'class': 'form-control text-center',
            }),
            'subtotal': forms.TextInput(attrs={
                'readonly': True,
                'class': 'form-control-plaintext text-center',
                'disabled': True,
            }),
            'total': forms.TextInput(attrs={
                'readonly': True,
                'class': 'form-control-plaintext text-center',
                'disabled': True,
            }),
        }


class ReportForm(forms.Form):
    date_range = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'form-control circular',
        'autocomplete': 'off',
    }))


class TaskForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['text'].widget.attrs['autofocus'] = True

    class Meta:
        model = Task
        fields = 'status', 'text', 'owner', 'priority'
        widgets = {
            'text': forms.TextInput(
                attrs={
                    'placeholder': 'Enter a text',
                    'minlength': 3
                }
            ),
            # 'owner': Select(
            #     attrs={
            #         'class': 'selectpicker',
            #         'style': 'width: 100%',
            #         'data-style': 'btn border-light circular-left',
            #         'data-live-search': 'true'
            #     }
            # ),
            'owner': Select(
                attrs={
                    'class': 'select2bs4 select2-danger form-control',
                    'data-dropdown-css-class': "select2-danger",
                }
            ),
            'priority': forms.Select(
                attrs={
                    'class': 'selectpicker',
                    'style': 'width: 100%',
                    'data-style': 'btn btn-default form-control circular',
                }
            ),
        }
        exclude = ['user_updated', 'user_creation']
