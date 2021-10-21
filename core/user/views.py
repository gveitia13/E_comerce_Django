from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import Group
from django.db import transaction
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views import generic
from django.views.decorators.csrf import csrf_exempt

from django.views.generic import TemplateView

from core.main.mixins import ValidatePermissionRequiredMixin
from core.main.views.dashboard.views import countEntity
from core.user.forms import UserForm
from core.user.models import User


# class UserView(TemplateView):
#     template_name = 'user/list.html'
#     form_class = UserForm
#     model = User
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['title'] = 'Users list'
#         context['entity'] = 'User'
#         context['entity_count'] = countEntity()
#         context['form'] = UserForm()
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
#                 data = [i.toJSON() for i in User.objects.all()]
#                 # print(data)
#             elif action == 'add':
#                 with transaction.atomic():
#                     UserForm(request.POST).save()
#                     data['success'] = 'added'
#                     data['object'] = User.objects.all().last().toJSON()
#             elif action == 'edit':
#                 pass
#             elif action == 'dele':
#                 with transaction.atomic():
#                     user = User.objects.get(pk=request.POST['id'])
#                     print(user.toJSON())
#                     user.delete()
#                     data['success'] = 'deleted'
#                     data['object'] = user.toJSON()
#             else:
#                 data['error'] = 'Pastillas chama'
#         except Exception as e:
#             data['error'] = str(e)
#         return JsonResponse(data, safe=False)

class UserListView(generic.ListView):
    model = User
    template_name = 'user/list.html'

    # permission_required = 'user.view_user'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'User list'
        context['create_url'] = reverse_lazy('user:user_create')
        context['list_url'] = reverse_lazy('user:user_list')
        context['entity'] = 'User'
        context['entity_count'] = countEntity()
        return context

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [i.toJSON() for i in User.objects.all()]
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)


class UserCreateView(LoginRequiredMixin, ValidatePermissionRequiredMixin, generic.CreateView):
    model = User
    form_class = UserForm
    template_name = 'user/create.html'
    success_url = reverse_lazy('user:user_list')
    # permission_required = 'user.add_user'
    url_redirect = success_url

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'add':
                form = self.get_form()
                data = form.save()
            else:
                data['error'] = 'No ha ingresado a ninguna opcion'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Create user'
        context['entity'] = 'User'
        context['list_url'] = self.success_url
        context['action'] = 'add'
        return context


# class UserUpdateView(generic.UpdateView):
#     model = User
#     form_class = UserForm
#     template_name = 'user/create.html'
#     success_url = reverse_lazy('user:user_list')
#     permission_required = 'user.change_user'
#     url_redirect = success_url
#
#     @method_decorator(csrf_exempt)
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
#                 data['error'] = 'No ha ingresado a ninguna opcion'
#         except Exception as e:
#             data['error'] = str(e)
#         return JsonResponse(data)
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['title'] = 'Edición de un usuario'
#         context['entity'] = 'Usuarios'
#         context['list_url'] = self.success_url
#         context['action'] = 'edit'
#         return context
#
#
# class UserDeleteView(generic.DeleteView):
#     model = User
#     template_name = 'user/delete.html'
#     success_url = reverse_lazy('user:user_list')
#     permission_required = 'user.delete_user'
#     url_redirect = success_url
#
#     def dispatch(self, request, *args, **kwargs):
#         self.object = self.get_object()
#         return super().dispatch(request, *args, **kwargs)
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['title'] = 'Eliminacion de un usuario'
#         context['entity'] = 'Usuarios'
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
class UserChangeGroup(LoginRequiredMixin, generic.View):

    def get(self, request, *args, **kwargs):
        try:
            request.session['group'] = Group.objects.get(pk=self.kwargs['pk'])
        except:
            pass
        return HttpResponseRedirect(reverse_lazy('dashboard'))
