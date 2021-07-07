from django.db import transaction
from django.forms import model_to_dict
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views import generic
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, ListView, UpdateView

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
                pass
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
                    cat.names = request.POST['name']
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

# class CategoryListView(generic.ListView):
#     model = Category
#     template_name = 'category/list.html'
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['title'] = 'Categories\' list'
#         context['create_url'] = reverse_lazy('main:category_create')
#         context['list_url'] = reverse_lazy('main:category_list')
#         context['entity'] = 'Categories'
#         return context
#
#     @method_decorator(csrf_exempt)
#     def dispatch(self, request, *args, **kwargs):
#         return super().dispatch(request, *args, **kwargs)
#
#     def post(self, request, *args, **kwargs):
#         data = {}
#         try:
#             action = request.POST['action']
#             if action == 'searchdata':
#                 data = []
#                 for i in Category.objects.all():
#                     data.append(i.toJSON())
#             else:
#                 data['error'] = 'An error has occurred'
#         except Exception as e:
#             data['error'] = str(e)
#         return JsonResponse(data, safe=False)
#
#
# class CategoryCreateView(generic.CreateView):
#     model = Category
#     form_class = CategoryForm
#     template_name = 'category/create.html'
#     success_url = reverse_lazy('main:category_list')
#     url_redirect = success_url
#
#     def dispatch(self, request, *args, **kwargs):
#         return super().dispatch(request, *args, **kwargs)
#
#     def post(self, request, *args, **kwargs):
#         data = {}
#         try:
#             action = request.POST['action']
#             if action == 'add':
#                 form = self.get_form()
#                 data = form.save()
#             else:
#                 data['error'] = 'You have not entered any option'
#         except Exception as e:
#             data['error'] = str(e)
#         return JsonResponse(data)
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['title'] = 'Category create'
#         context['entity'] = 'Categories'
#         context['list_url'] = self.success_url
#         context['action'] = 'add'
#         return context
#
#
# class CategoryUpdateView(generic.UpdateView):
#     model = Category
#     form_class = CategoryForm
#     template_name = 'category/create.html'
#     success_url = reverse_lazy('main:category_list')
#     url_redirect = success_url
#
#     def dispatch(self, request, *args, **kwargs):
#         self.object = self.get_object()
#         return super().dispatch(request, *args, **kwargs)
#
#     def post(self, request, *args, **kwargs):
#         data = {}
#         try:
#             action = request.POST['action']
#             if action == 'edit':
#                 form = self.get_form()
#                 data = form.save()
#             else:
#                 data['error'] = 'You have not entered any option'
#         except Exception as e:
#             data['error'] = str(e)
#         return JsonResponse(data)
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['title'] = 'Category edit'
#         context['entity'] = 'Categories'
#         context['list_url'] = self.success_url
#         context['action'] = 'edit'
#         return context
#
#
# class CategoryDeleteView(generic.DeleteView):
#     model = Category
#     template_name = 'category/delete.html'
#     success_url = reverse_lazy('main:category_list')
#     url_redirect = success_url
#
#     def dispatch(self, request, *args, **kwargs):
#         self.object = self.get_object()
#         return super().dispatch(request, *args, **kwargs)
#
#     def get_context_data(self, queryset=Category.objects.all(), **kwargs):
#         context = super().get_context_data(queryset=Category.objects.all(), **kwargs)
#         context['title'] = 'Category Delete'
#         context['entity'] = 'Categories'
#         context['list_url'] = self.success_url
#         return context
#
#     def post(self, request, *args, **kwargs):
#         data = {}
#         try:
#             self.object.delete()
#         except Exception as e:
#             data['error'] = str(e)
#         return JsonResponse(data)
#
#
# class CategoryFormView(generic.FormView):
#     form_class = CategoryForm
#     template_name = 'category/create.html'
#     success_url = reverse_lazy('main:category_list')
#
#     def form_invalid(self, form):
#         print(form.errors)
#         return super().form_invalid(form)
#
#     def form_valid(self, form):
#         return super().form_valid(form)
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['title'] = 'Form | Category'
#         context['entity'] = 'Categories'
#         context['list_url'] = reverse_lazy('main:category_list')
#         context['action'] = 'add'
#         return context
