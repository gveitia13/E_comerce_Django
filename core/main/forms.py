from django.forms import ModelForm
from django import forms
from core.main.models import Category


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
