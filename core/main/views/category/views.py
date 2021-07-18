from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from core.main.forms import CategoryForm
from core.main.models import Category


class CategoryView(TemplateView):
    template_name = 'category/list.html'
    model = Category

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [c.toJSON() for c in Category.objects.all()]
            elif action == 'add':
                with transaction.atomic():
                    cat = Category()
                    cat.name = request.POST['name']
                    cat.desc = request.POST['desc']
                    cat.save()
                    data['success'] = 'added'
                    data['object'] = cat.toJSON()
            elif action == 'edit':
                with transaction.atomic():
                    cat = Category.objects.get(pk=request.POST['id'])
                    cat.name = request.POST['name']
                    cat.desc = request.POST['desc']
                    cat.save()
                    data['success'] = 'updated'
                    data['object'] = cat.toJSON()
            elif action == 'dele':
                with transaction.atomic():
                    cat = Category.objects.get(pk=request.POST['id'])
                    cat.delete()
                    data['success'] = 'deleted'
                    data['object'] = cat.toJSON()
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Categories\' list'
        context['list_url'] = reverse_lazy('main:category_list')
        context['form'] = CategoryForm()
        context['lista'] = Category.objects.all()
        context['entity'] = 'Category'
        return context
