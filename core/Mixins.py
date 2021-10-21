from django.views import View

from core.main.models import Category, Product, Client


class GetObjects(View):
    def get_context_data(self, **kwargs):
        context = {
            'all_category': Category.objects.all(),
            'all_product': Product.objects.all(),
            'all_client': Client.objects.all(),
        }
        return context

    class Meta:
        abstract = True
