from django.forms import ModelForm

from core.startpage.models import Cart


class CartForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    class Meta:
        model = Cart
        fields = '__all__'
        exclude = ['date_joined', ]
