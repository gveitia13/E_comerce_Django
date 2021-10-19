import datetime

from crum import get_current_request
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from conf.settings import MEDIA_URL, STATIC_URL
from django.forms import model_to_dict


class User(AbstractUser):
    image = models.ImageField(upload_to='users/%Y/%m/%d', null=True, blank=True)
    token = models.UUIDField(primary_key=False, editable=False, null=True, blank=True)
    phone_regex = RegexValidator(
        regex=r'\+?1?\d{9,15}$',
        message='Phone number must be entered in the format: +9999999999. Up to 15 digits allowed.'
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    email = models.EmailField('email address', unique=True,
                              error_messages={'unique': 'A user with that email already exists.'})
    REQUIRED_FIELDS = ['username', 'email', 'first_name', 'last_name']

    # USERNAME_FIELD = 'email'

    def __str__(self):
        return self.username

    def get_image(self):
        if self.image:
            return '{}{}'.format(MEDIA_URL, self.image)
        return '{}{}'.format(STATIC_URL, 'img/user2.png')

    def get_short_login_date(self):
        if self.last_login:
            return self.last_login.strftime('%b %d, %Y')
        else:
            return 'Not logged yet'

    def toJSON(self):
        item = model_to_dict(self, exclude=['password', 'user_permissions', 'last_login'])
        if self.last_login:
            item['last_login'] = self.last_login.strftime('%Y-%m-%d')
        item['date_joined'] = self.date_joined.strftime('%Y-%m-%d')
        item['image'] = self.get_image()
        item['full_name'] = self.get_full_name()
        item['groups'] = [{'id': g.id, 'name': g.name} for g in self.groups.all()]
        return item

    def get_user_session(self):
        try:
            request = get_current_request()
            groups = self.groups.all()
            if groups.exists():
                if 'group' not in request.session:
                    request.session['group'] = groups[0]
        except:
            pass


class UserProfile(models.Model):
    user = models.OneToOneField('user.User', on_delete=models.CASCADE)
    picture = models.ImageField(
        'profile picture',
        upload_to='users/pictures',
        blank=True,
        null=True
    )
    biography = models.TextField(max_length=500, blank=True)
    # Stats
    sales_made = models.PositiveIntegerField(default=0)
    products_added = models.PositiveIntegerField(default=0)
    carts_sent = models.PositiveIntegerField(default=0)
    reputation = models.FloatField(default=5.0)

    def __str__(self):
        return str(self.user)
